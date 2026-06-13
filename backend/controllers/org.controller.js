const prisma = require('../prismaClient');

exports.getAllOrgNodes = async (req, res) => {
  try {
    const nodes = await prisma.orgStructure.findMany();
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createOrgNode = async (req, res) => {
  try {
    const { name, parent_id, leader_id } = req.body;
    const node = await prisma.orgStructure.create({
      data: { name, parent_id, leader_id }
    });
    res.json({ success: true, node });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrgNode = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parent_id, leader_id } = req.body;
    const node = await prisma.orgStructure.update({
      where: { id },
      data: { name, parent_id, leader_id }
    });
    res.json({ success: true, node });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteOrgNode = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.orgStructure.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
