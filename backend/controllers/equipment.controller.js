const prisma = require('../prismaClient');

exports.getAllEquipment = async (req, res) => {
  try {
    const equip = await prisma.equipment.findMany();
    res.json(equip);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createEquipment = async (req, res) => {
  try {
    const { name, category, quantity_total, quantity_available, description } = req.body;
    const equip = await prisma.equipment.create({
      data: { name, category, quantity_total, quantity_available, description }
    });
    res.json({ success: true, equip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity_available } = req.body;
    const equip = await prisma.equipment.update({
      where: { id },
      data: { quantity_available }
    });
    res.json({ success: true, equip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Rental routes
exports.getAllRentals = async (req, res) => {
  try {
    const rentals = await prisma.rentalRequest.findMany();
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createRental = async (req, res) => {
  try {
    const { equipment_id, start_date, end_date, notes } = req.body;
    const rental = await prisma.rentalRequest.create({
      data: {
        requester_id: req.user.id,
        equipment_id,
        start_date,
        end_date,
        status: 'pending',
        notes
      }
    });
    res.json({ success: true, rental });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRentalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const rental = await prisma.rentalRequest.update({
      where: { id },
      data: { status }
    });
    res.json({ success: true, rental });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
