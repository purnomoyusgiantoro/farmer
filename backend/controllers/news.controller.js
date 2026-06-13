const prisma = require('../prismaClient');

exports.getAllNews = async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      include: {
        author: { select: { name: true, role: true } }
      },
      orderBy: { published_at: 'desc' }
    });
    res.json(news);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createNews = async (req, res) => {
  try {
    const { title, content } = req.body;
    const news = await prisma.news.create({
      data: {
        author_id: req.user.id,
        title,
        content
      }
    });
    res.json({ success: true, news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const news = await prisma.news.update({
      where: { id },
      data: { title, content }
    });
    res.json({ success: true, news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.news.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
