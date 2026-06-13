const prisma = require('../prismaClient');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        region: true,
        status: true,
        created_at: true,
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, name, role, region, status } = req.body;
    
    // Check existing
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar.' });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password, // Usually hashed, we keep plain text here for demo or we should hash it. Frontend sends plain.
        name,
        role,
        region,
        status: status || 'active'
      }
    });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const user = await prisma.user.update({
      where: { id },
      data: { status }
    });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
