const express = require('express');
const router = express.Router();
const Coupon = require('../models/couponmodel');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'pecommerce8@gmail.com',
    pass: 'rqrdabxuzpaecigz'
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function sendEmailToAllUsers(subject, message) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'pecommerce8@gmail.com', // Replace with your email
          pass: 'rqrdabxuzpaecigz' // Replace with your password
        }
      });
  
      const users = await mongoose.model('User').find({}, 'email');
      
      for (const user of users) {
        await transporter.sendMail({
          from: 'pecommerce8@gmail.com',
          to: user.email,
          subject: subject,
          text: message
        });
      }
    } catch (error) {
      console.error('Error sending emails:', error);
    }
  }
  
  // Get all coupons route
  router.get('/get-coupon', async (req, res) => {
    try {
      const coupons = await Coupon.find();
      res.status(200).json({
        success: true,
        coupons
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching coupons',
        error: error.message
      });
    }
  });
  
  // Save coupon route
  router.post('/save-coupon', async (req, res) => {
    try {
      const { code, discountPercentage } = req.body;
  
      const coupon = new Coupon({
        code,
        discountPercentage
      });
  
      await coupon.save();
  
      // Send email to all users about new coupon
      const subject = 'New Coupon Available!';
      const message = `A new coupon ${code} is now available with ${discountPercentage}% discount. Use it in your next purchase!`;
      await sendEmailToAllUsers(subject, message);
  
      res.status(201).json({
        success: true,
        message: 'Coupon saved successfully',
        coupon
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error saving coupon',
        error: error.message
      });
    }
  });
  
  // Verify coupon route
  router.post('/verify-coupon', async (req, res) => {
    try {
      const { code } = req.body;
      
      const coupon = await Coupon.findOne({ code });
      
      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Invalid coupon code'
        });
      }
  
      res.status(200).json({
        success: true,
        discountPercentage: coupon.discountPercentage
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error verifying coupon',
        error: error.message
      });
    }
  });
  
  // Delete coupon route
  router.delete('/delete-coupon', async (req, res) => {
    try {
      const { code, discountPercentage } = req.body;
      
      const deletedCoupon = await Coupon.findOneAndDelete({ 
        code,
        discountPercentage 
      });
  
      if (!deletedCoupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }
  
      // Send email to all users about expired coupon
      const subject = 'Coupon Expired';
      const message = `The coupon ${code} with ${discountPercentage}% discount has expired.`;
      await sendEmailToAllUsers(subject, message);
  
      res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting coupon',
        error: error.message
      });
    }
  });

  module.exports = router
  