const serviceService = require('../Services/serviceService');
const { Icon } = require('../Models/Icon');

async function createService(req, res) {
  try {
    const { serviceName, description, iconId } = req.body;
    if (!serviceName || !iconId) return res.status(400).json({ message: 'serviceName and iconId are required' });

    // Validate icon exists
    const icon = await Icon.findById(iconId);
    if (!icon) return res.status(400).json({ message: 'iconId not found' });

    const created = await serviceService.createService({ serviceName, description, iconId });
    return res.status(201).json(created);
  } catch (err) {
    console.error('createService error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getServices(req, res) {
  try {
    const services = await serviceService.getServices();
    // Optionally populate icon info for client convenience
    const populated = await Promise.all(services.map(async s => {
      const ic = await Icon.findById(s.iconId).select('name icon');
      return { ...s.toObject(), icon: ic };
    }));
    return res.json(populated);
  } catch (err) {
    console.error('getServices error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getServiceById(req, res) {
  try {
    const { id } = req.params;
    const svc = await serviceService.getServiceById(id);
    if (!svc) return res.status(404).json({ message: 'Service not found' });
    const ic = await Icon.findById(svc.iconId).select('name icon');
    return res.json({ ...svc.toObject(), icon: ic });
  } catch (err) {
    console.error('getServiceById error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function updateService(req, res) {
  try {
    const { id } = req.params;
    const { serviceName, description, iconId } = req.body;

    if (iconId) {
      const icon = await Icon.findById(iconId);
      if (!icon) return res.status(400).json({ message: 'iconId not found' });
    }

    const updated = await serviceService.updateService(id, { serviceName, description, iconId });
    if (!updated) return res.status(404).json({ message: 'Service not found' });
    return res.json(updated);
  } catch (err) {
    console.error('updateService error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function deleteService(req, res) {
  try {
    const { id } = req.params;
    const deleted = await serviceService.deleteService(id);
    if (!deleted) return res.status(404).json({ message: 'Service not found' });
    return res.json({ message: 'Service deleted' });
  } catch (err) {
    console.error('deleteService error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { createService, getServices, getServiceById, updateService, deleteService };
