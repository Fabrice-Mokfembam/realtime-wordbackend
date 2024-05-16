import { Schema, model } from "mongoose";

const documentSchema = new Schema({
    name: String,
    textContent: {
        type: String,
        default:''
    }
}, {
    timestamps:true
})

const Document = model('Document', documentSchema);
export {Document}