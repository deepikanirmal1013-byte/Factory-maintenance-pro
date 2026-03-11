import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://fzviicmixctlpfyisvhc.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6dmlpY21peGN0bHBmeWlzdmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzg2MjAsImV4cCI6MjA4ODYxNDYyMH0.vY9KX9RoS5noa6Y4EAP7SSqtMjmnos4TbLsI3ei92TY';

console.log('Supabase Config:', {
  url: supabaseUrl,
  key: supabaseKey ? `${supabaseKey.substring(0, 10)}...` : 'MISSING'
});

const supabase = createClient(supabaseUrl, supabaseKey);

// Startup check
const tablesToCheck = ['machines', 'notifications', 'users', 'spare_parts', 'breakdowns', 'maintenance'];
tablesToCheck.forEach(table => {
  supabase.from(table).select('id').limit(1).then(({ error }) => {
    if (error) {
      console.error(`Supabase startup check failed for table "${table}".`, error.message);
    } else {
      console.log(`Supabase connection successful: table "${table}" found.`);
    }
  });
});

// Helper for notifications
async function createNotification(userId: number | null, title: string, message: string, type: 'info' | 'warning' | 'error' = 'info') {
  const created_at = new Date().toISOString();
  if (userId) {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      created_at
    });
  } else {
    // Notify all admins/managers/techs
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .in('role', ['admin', 'manager', 'technician']);
    
    if (users) {
      const notifications = users.map(u => ({
        user_id: u.id,
        title,
        message,
        type,
        created_at
      }));
      await supabase.from('notifications').insert(notifications);
    }
  }
}

async function updateMachineStatus(machineId: number, status: string, customMessage?: string) {
  const { data: machine } = await supabase
    .from('machines')
    .select('name')
    .eq('id', machineId)
    .single();

  if (!machine) return;

  await supabase
    .from('machines')
    .update({ status })
    .eq('id', machineId);

  if (status === 'maintenance_due' || status === 'under_repair') {
    const title = status === 'maintenance_due' ? 'Maintenance Due' : 'Machine Breakdown';
    const type = status === 'maintenance_due' ? 'warning' : 'error';
    const message = customMessage || (status === 'maintenance_due' 
      ? `Machine ${machine.name} is now due for maintenance.` 
      : `Machine ${machine.name} has been marked as under repair.`);
    
    await createNotification(null, title, message, type);
  }
}

// Initialize Database
// Removed SQLite initialization as we are using Supabase

// Migrations for existing databases
// Removed SQLite migrations

// Seed Data if empty
// Removed SQLite seeding

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.get('/api/stats', async (req, res) => {
    try {
      const { count: totalMachines, error: e1 } = await supabase.from('machines').select('*', { count: 'exact', head: true });
      const { count: runningMachines, error: e2 } = await supabase.from('machines').select('*', { count: 'exact', head: true }).eq('status', 'running');
      const { count: repairMachines, error: e3 } = await supabase.from('machines').select('*', { count: 'exact', head: true }).eq('status', 'under_repair');
      const { count: maintenanceDue, error: e4 } = await supabase.from('machines').select('*', { count: 'exact', head: true }).eq('status', 'maintenance_due');
      
      if (e1 || e2 || e3 || e4) {
        console.error('Supabase error fetching stats:', { e1, e2, e3, e4 });
      }

      const { data: parts, error: e5 } = await supabase.from('spare_parts').select('stock, min_stock');
      if (e5) console.error('Supabase error fetching parts for stats:', e5);
      const lowStockCount = parts?.filter(p => p.stock <= p.min_stock).length || 0;

      const today = new Date().toISOString().split('T')[0];
      const { count: todayBreakdowns, error: e6 } = await supabase.from('breakdowns').select('*', { count: 'exact', head: true }).gte('reported_at', today);
      if (e6) console.error('Supabase error fetching today breakdowns:', e6);

      res.json({
        totalMachines: totalMachines || 0,
        runningMachines: runningMachines || 0,
        repairMachines: repairMachines || 0,
        maintenanceDue: maintenanceDue || 0,
        lowStock: lowStockCount,
        todayBreakdowns: todayBreakdowns || 0
      });
    } catch (error) {
      console.error('Unexpected error in /api/stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/machines', async (req, res) => {
    const { data: machines } = await supabase.from('machines').select('*').order('created_at', { ascending: false });
    res.json(machines || []);
  });

  app.get('/api/machines/:id', async (req, res) => {
    const id = req.params.id;
    const { data: machine } = await supabase
      .from('machines')
      .select('*')
      .or(`id.eq.${isNaN(Number(id)) ? -1 : id},qr_code.eq.${id}`)
      .single();
    
    if (!machine) return res.status(404).json({ error: 'Machine not found' });
    res.json(machine);
  });

  app.post('/api/machines', async (req, res) => {
    const { name, type, model, serial_number, line, location, qr_code, purchase_date } = req.body;
    console.log('Adding machine:', { name, qr_code });
    
    const { data, error } = await supabase
      .from('machines')
      .insert({ 
        name, 
        type, 
        model, 
        serial_number, 
        line, 
        location, 
        qr_code: qr_code || null, 
        purchase_date: purchase_date || null 
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error adding machine:', error);
      return res.status(400).json({ 
        error: error.message,
        details: error.details,
        hint: error.hint
      });
    }
    res.json({ id: data.id });
  });

  app.put('/api/machines/:id', async (req, res) => {
    const { name, type, model, serial_number, line, location, qr_code, purchase_date, status } = req.body;
    const { error } = await supabase
      .from('machines')
      .update({ name, type, model, serial_number, line, location, qr_code, purchase_date, status })
      .eq('id', req.params.id);
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  app.delete('/api/machines/:id', async (req, res) => {
    const { error } = await supabase.from('machines').delete().eq('id', parseInt(req.params.id));
    if (error) {
      console.error('Error deleting machine:', error);
      return res.status(400).json({ error: error.message });
    }
    res.json({ success: true });
  });

  app.put('/api/machines/:id/status', async (req, res) => {
    const { status } = req.body;
    await updateMachineStatus(Number(req.params.id), status);
    res.json({ success: true });
  });

  app.get('/api/notifications', async (req, res) => {
    console.log('GET /api/notifications hit');
    try {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Supabase error fetching notifications:', error);
        return res.status(500).json({ error: error.message });
      }
      
      res.json(notifications || []);
    } catch (err) {
      console.error('Unexpected error fetching notifications:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/notifications/:id/read', async (req, res) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', req.params.id);
    res.json({ success: true });
  });

  app.post('/api/notifications/read-all', async (req, res) => {
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    res.json({ success: true });
  });

  app.get('/api/breakdowns', async (req, res) => {
    const { data: breakdowns } = await supabase
      .from('breakdowns')
      .select(`
        *,
        machines (name, line),
        users!breakdowns_reported_by_id_fkey (name)
      `)
      .order('reported_at', { ascending: false });
    
    // Flatten the response to match the expected format
    const formatted = breakdowns?.map(b => ({
      ...b,
      machine_name: b.machines?.name,
      machine_line: b.machines?.line,
      reported_by_name: b.users?.name
    }));

    res.json(formatted || []);
  });

  app.post('/api/breakdowns', async (req, res) => {
    const { machine_id, issue, priority, reported_by_id } = req.body;
    const { data, error } = await supabase
      .from('breakdowns')
      .insert({ machine_id, issue, priority, reported_by_id })
      .select()
      .single();
    
    if (error) return res.status(400).json({ error: error.message });
    
    await updateMachineStatus(machine_id, 'under_repair', `Machine Breakdown: ${issue} (Priority: ${priority})`);

    res.json({ id: data.id });
  });

  app.get('/api/maintenance', async (req, res) => {
    const { data: maintenance } = await supabase
      .from('maintenance')
      .select(`
        *,
        machines (name, qr_code, line),
        users (name)
      `)
      .order('date', { ascending: false });
    
    const formatted = maintenance?.map(m => ({
      ...m,
      machine_name: m.machines?.name,
      machine_no: m.machines?.qr_code,
      machine_line: m.machines?.line,
      technician_name: m.users?.name
    }));

    res.json(formatted || []);
  });

  app.post('/api/maintenance/:id/accept', async (req, res) => {
    const { technician_id } = req.body;
    const accepted_at = new Date().toISOString();
    await supabase
      .from('maintenance')
      .update({ status: 'accepted', accepted_at, technician_id })
      .eq('id', req.params.id);
    res.json({ success: true });
  });

  app.post('/api/maintenance/:id/complete', async (req, res) => {
    const { description } = req.body;
    const completed_at = new Date().toISOString();
    
    const { data: maintenance } = await supabase
      .from('maintenance')
      .select('machine_id')
      .eq('id', req.params.id)
      .single();
    
    await supabase
      .from('maintenance')
      .update({ status: 'completed', completed_at, description })
      .eq('id', req.params.id);
    
    if (maintenance) {
      await updateMachineStatus(maintenance.machine_id, 'running');
    }
    
    res.json({ success: true });
  });

  app.post('/api/maintenance', async (req, res) => {
    const { machine_id, type, technician_id, date, checklist, status, description } = req.body;
    const { data, error } = await supabase
      .from('maintenance')
      .insert({ 
        machine_id, 
        type, 
        technician_id, 
        date, 
        checklist, 
        status: status || 'pending',
        description: description || '',
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .select()
      .single();
    
    if (error) return res.status(400).json({ error: error.message });
    
    if (status !== 'completed') {
      await updateMachineStatus(machine_id, 'maintenance_due');
    } else {
      await updateMachineStatus(machine_id, 'running');
    }

    if (technician_id) {
      const { data: machine } = await supabase.from('machines').select('name').eq('id', machine_id).single();
      if (machine) {
        await createNotification(
          technician_id, 
          'New Maintenance Task', 
          `You have been assigned a ${type} for machine ${machine.name} on ${date}`, 
          'info'
        );
      }
    }

    res.json({ id: data.id });
  });

  app.put('/api/maintenance/:id', async (req, res) => {
    const { machine_id, type, technician_id, date, checklist, status, description } = req.body;
    await supabase
      .from('maintenance')
      .update({ machine_id, type, technician_id, date, checklist, status, description })
      .eq('id', req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/maintenance/:id', async (req, res) => {
    const { error } = await supabase.from('maintenance').delete().eq('id', parseInt(req.params.id));
    if (error) {
      console.error('Error deleting maintenance:', error);
      return res.status(400).json({ error: error.message });
    }
    res.json({ success: true });
  });

  app.get('/api/spare-parts', async (req, res) => {
    const { data: parts } = await supabase.from('spare_parts').select('*').order('name');
    res.json(parts || []);
  });

  app.post('/api/spare-parts', async (req, res) => {
    const { name, code, stock, min_stock, unit, needle_size } = req.body;
    console.log('Adding/Updating spare part:', { name, code });

    try {
      const { data: existingPart, error: selectError } = await supabase
        .from('spare_parts')
        .select('*')
        .eq('code', code)
        .maybeSingle();
      
      if (selectError) {
        console.error('Supabase error checking existing part:', selectError);
      }
      
      if (existingPart) {
        const newStock = (existingPart.stock || 0) + (stock || 0);
        const { error: updateError } = await supabase
          .from('spare_parts')
          .update({ stock: newStock, name, min_stock, unit: unit || 'pcs', needle_size })
          .eq('id', existingPart.id);
        
        if (updateError) {
          console.error('Supabase error updating part stock:', updateError);
          return res.status(400).json({ error: updateError.message });
        }
        
        res.json({ id: existingPart.id, updated: true, newStock });
      } else {
        const { data, error: insertError } = await supabase
          .from('spare_parts')
          .insert({ name, code, stock: stock || 0, min_stock: min_stock || 0, unit: unit || 'pcs', needle_size })
          .select()
          .maybeSingle();
        
        if (insertError) {
          console.error('Supabase error inserting new part:', insertError);
          return res.status(400).json({ 
            error: insertError.message,
            details: insertError.details,
            hint: insertError.hint
          });
        }
        
        if (!data) {
          return res.status(500).json({ error: 'Failed to create part: No data returned' });
        }
        
        res.json({ id: data.id, updated: false, newStock: stock });
      }
    } catch (error) {
      console.error('Unexpected error in /api/spare-parts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/spare-parts/:id', async (req, res) => {
    const { name, code, stock, min_stock, unit, needle_size } = req.body;
    await supabase
      .from('spare_parts')
      .update({ name, code, stock, min_stock, unit, needle_size })
      .eq('id', req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/spare-parts/:id', async (req, res) => {
    const { error } = await supabase.from('spare_parts').delete().eq('id', parseInt(req.params.id));
    if (error) {
      console.error('Error deleting spare part:', error);
      return res.status(400).json({ error: error.message });
    }
    res.json({ success: true });
  });

  app.get('/api/spare-parts/usage', async (req, res) => {
    const { data: usage } = await supabase
      .from('spare_part_usage')
      .select(`
        *,
        machines (name, qr_code),
        spare_parts (name, code, unit),
        users (name)
      `)
      .order('date', { ascending: false });
    
    const formatted = usage?.map(u => ({
      ...u,
      machine_name: u.machines?.name,
      machine_no: u.machines?.qr_code,
      part_name: u.spare_parts?.name,
      part_code: u.spare_parts?.code,
      unit: u.spare_parts?.unit,
      technician_name: u.users?.name
    }));

    res.json(formatted || []);
  });

  app.post('/api/spare-parts/usage', async (req, res) => {
    const { machine_id, part_id, quantity, technician_id } = req.body;
    const date = new Date().toISOString();
    
    const { data: part } = await supabase.from('spare_parts').select('stock').eq('id', part_id).single();
    if (!part) return res.status(404).json({ error: 'Part not found' });

    await supabase.from('spare_part_usage').insert({ machine_id, part_id, quantity, technician_id, date });
    await supabase.from('spare_parts').update({ stock: part.stock - quantity }).eq('id', part_id);
    
    res.json({ success: true });
  });

  app.get('/api/machines/:id/history', async (req, res) => {
    const { data: maintenance } = await supabase
      .from('maintenance')
      .select('*, users (name)')
      .eq('machine_id', req.params.id)
      .order('date', { ascending: false });

    const { data: breakdowns } = await supabase
      .from('breakdowns')
      .select('*, users!breakdowns_reported_by_id_fkey (name), users!breakdowns_technician_id_fkey (name)')
      .eq('machine_id', req.params.id)
      .order('reported_at', { ascending: false });

    const formattedMaintenance = maintenance?.map(m => ({ ...m, technician_name: m.users?.name }));
    const formattedBreakdowns = breakdowns?.map(b => ({ 
      ...b, 
      reported_by_name: b.users?.[0]?.name, 
      technician_name: b.users?.[1]?.name 
    }));

    res.json({ maintenance: formattedMaintenance || [], breakdowns: formattedBreakdowns || [] });
  });

  app.get('/api/technicians', async (req, res) => {
    const { data: techs } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'technician');
    
    // In a real app, you'd do more complex aggregation here or use a view/RPC
    // For now, we'll return the techs with some mock stats or just the basic info
    const formatted = techs?.map(t => ({
      ...t,
      completedTasks: 0, // Placeholder
      avgCompletionTime: 0 // Placeholder
    }));

    res.json(formatted || []);
  });

  app.post('/api/technicians', async (req, res) => {
    const { name, email, password } = req.body;
    const { data, error } = await supabase
      .from('users')
      .insert({ name, email, role: 'technician', password: password || 'password123' })
      .select()
      .single();
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ id: data.id });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
