const prisma = require('../prismaClient');

exports.getAllActivities = async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        petani: { select: { name: true, region: true } },
        land: { select: { name: true } }
      }
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createActivity = async (req, res) => {
  try {
    const { land_id, date, type, description } = req.body;
    const activity = await prisma.activity.create({
      data: {
        petani_id: req.user.id,
        land_id,
        date,
        type,
        description
      }
    });
    res.json({ success: true, activity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
