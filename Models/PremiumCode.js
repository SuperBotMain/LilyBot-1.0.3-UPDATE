const mongoose = require("mongoose");

const PremiumCodeSchema = new mongoose.Schema({
    activationKey: { type: String, unique: true, required: true },
    durationInDays: { type: Number, required: true },
    createdBy: { type: String, required: true }, // Felhasználó azonosítója, aki létrehozta a kódot
    createdAt: { type: Date, default: Date.now },
});

const PremiumCode = mongoose.model("PremiumCode", PremiumCodeSchema);

module.exports = PremiumCode;
