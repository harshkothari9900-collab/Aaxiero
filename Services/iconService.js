const { Icon } = require('../Models/Icon');

async function createIcon(data) {
  const icon = new Icon(data);
  return await icon.save();
}

async function getIcons() {
  return await Icon.find().sort({ createdAt: -1 });
}

module.exports = { createIcon, getIcons };
