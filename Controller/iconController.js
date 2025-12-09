const iconService = require('../Services/iconService');

async function createIcon(req, res) {
  try {
    const { name, icon } = req.body;
    if (!name || !icon) return res.status(400).json({ message: 'Both name and icon are required' });

    const created = await iconService.createIcon({ name, icon });
    return res.status(201).json(created);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Icon with this name already exists' });
    console.error('createIcon error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getIcons(req, res) {
  try {
    const icons = await iconService.getIcons();
    return res.json(icons);
  } catch (err) {
    console.error('getIcons error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { createIcon, getIcons };
