const { Service } = require('../Models/Service');

async function createService(data) {
  const svc = new Service(data);
  return await svc.save();
}

async function getServices() {
  return await Service.find().sort({ createdAt: -1 });
}

async function getServiceById(id) {
  return await Service.findById(id);
}

async function updateService(id, data) {
  return await Service.findByIdAndUpdate(id, data, { new: true });
}

async function deleteService(id) {
  return await Service.findByIdAndDelete(id);
}

module.exports = { createService, getServices, getServiceById, updateService, deleteService };
