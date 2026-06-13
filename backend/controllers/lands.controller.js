const prisma = require('../prismaClient');

exports.getAllLands = async (req, res) => {
  try {
    const lands = await prisma.land.findMany({
      include: {
        owner: {
          select: { name: true, region: true, email: true }
        }
      }
    });
    res.json(lands);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createLand = async (req, res) => {
  try {
    const { owner_id, name, area_ha, location } = req.body;
    const land = await prisma.land.create({
      data: {
        owner_id: owner_id || req.user.id,
        name,
        area_ha: parseFloat(area_ha),
        location,
        verification_status: 'pending',
        status: 'active'
      }
    });
    res.json({ success: true, land });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateLandStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { verification_status } = req.body;
    const land = await prisma.land.update({
      where: { id },
      data: { verification_status }
    });
    res.json({ success: true, land });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateLandData = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, area_ha, location } = req.body;
    
    // Log edit
    const oldLand = await prisma.land.findUnique({ where: { id } });
    if (oldLand) {
      await prisma.landEdit.create({
        data: {
          land_id: id,
          editor_id: req.user.id,
          changes: `Diubah dari: ${oldLand.name} (${oldLand.area_ha} Ha, ${oldLand.location}) -> Menjadi: ${name} (${area_ha} Ha, ${location})`
        }
      });
    }

    const land = await prisma.land.update({
      where: { id },
      data: {
        name,
        area_ha: parseFloat(area_ha),
        location,
        verification_status: 'pending' // need reverification
      }
    });
    
    res.json({ success: true, land });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
