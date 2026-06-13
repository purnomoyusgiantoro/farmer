const prisma = require('../prismaClient');

exports.getAllLogs = async (req, res) => {
  try {
    const logs = await prisma.systemLog.findMany({
      orderBy: { timestamp: 'desc' }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createLog = async (req, res) => {
  try {
    const { action, entity, entity_id } = req.body;
    
    // Get user info
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const log = await prisma.systemLog.create({
      data: {
        user_id: user.id,
        user_name: user.name,
        user_email: user.email,
        action,
        entity,
        entity_id: String(entity_id),
        ip_address: req.ip || '127.0.0.1'
      }
    });

    res.json({ success: true, log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
