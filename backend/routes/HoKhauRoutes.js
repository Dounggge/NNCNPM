const express = require('express');
const router = express.Router();
const HoKhau = require('../models/HoKhau');
const NhanKhau = require('../models/NhanKhau');

// Get all với populate
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (search) {
      query.soHoKhau = { $regex: search, $options: 'i' };
    }

    const hoKhaus = await HoKhau.find(query)
      .populate('chuHo', 'hoTen cmnd')
      .populate('thanhVien', 'hoTen cmnd quanHeVoiChuHo')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await HoKhau.countDocuments(query);

    res.json({
      data: hoKhaus,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get by ID
router.get('/:id', async (req, res) => {
  try {
    const hoKhau = await HoKhau.findById(req.params.id)
      .populate('chuHo')
      .populate('thanhVien');
      
    if (!hoKhau) {
      return res.status(404).json({ message: 'Không tìm thấy hộ khẩu' });
    }
    res.json(hoKhau);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Create
router.post('/', async (req, res) => {
  try {
    const { chuHo, thanhVien } = req.body;
    
    // Verify chủ hộ exists
    const chuHoExists = await NhanKhau.findById(chuHo);
    if (!chuHoExists) {
      return res.status(400).json({ message: 'Chủ hộ không tồn tại' });
    }

    const hoKhau = new HoKhau({ chuHo, thanhVien: thanhVien || [] });
    await hoKhau.save();
    
    const populated = await HoKhau.findById(hoKhau._id)
      .populate('chuHo')
      .populate('thanhVien');
    
    res.status(201).json({ message: 'Thêm hộ khẩu thành công', data: populated });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Add thành viên vào hộ khẩu
router.post('/:id/thanh-vien', async (req, res) => {
  try {
    const { nhanKhauId } = req.body;
    
    const hoKhau = await HoKhau.findById(req.params.id);
    if (!hoKhau) {
      return res.status(404).json({ message: 'Không tìm thấy hộ khẩu' });
    }

    if (hoKhau.thanhVien.includes(nhanKhauId)) {
      return res.status(400).json({ message: 'Nhân khẩu đã có trong hộ' });
    }

    hoKhau.thanhVien.push(nhanKhauId);
    await hoKhau.save();

    const updated = await HoKhau.findById(hoKhau._id)
      .populate('chuHo')
      .populate('thanhVien');

    res.json({ message: 'Thêm thành viên thành công', data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Remove thành viên
router.delete('/:id/thanh-vien/:nhanKhauId', async (req, res) => {
  try {
    const hoKhau = await HoKhau.findById(req.params.id);
    if (!hoKhau) {
      return res.status(404).json({ message: 'Không tìm thấy hộ khẩu' });
    }

    hoKhau.thanhVien = hoKhau.thanhVien.filter(
      tv => tv.toString() !== req.params.nhanKhauId
    );
    await hoKhau.save();

    res.json({ message: 'Xóa thành viên thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const hoKhau = await HoKhau.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('chuHo').populate('thanhVien');
    
    if (!hoKhau) {
      return res.status(404).json({ message: 'Không tìm thấy hộ khẩu' });
    }
    
    res.json({ message: 'Cập nhật thành công', data: hoKhau });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const hoKhau = await HoKhau.findByIdAndDelete(req.params.id);
    if (!hoKhau) {
      return res.status(404).json({ message: 'Không tìm thấy hộ khẩu' });
    }
    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;