const NhanKhau = require('../models/NhanKhau');

exports.list = async (req, res) => {
  try {
    const items = await NhanKhau.find().limit(500);
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const item = await NhanKhau.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const newItem = new NhanKhau(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const updated = await NhanKhau.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    await NhanKhau.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) { res.status(500).json({ error: err.message }); }
};