import mongoose from 'mongoose';

const WhatsappSchema = new mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
});

export default mongoose.model('messagecontents', WhatsappSchema);