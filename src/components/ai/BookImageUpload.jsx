"use client";
import { Upload } from "lucide-react";
function BookImageUpload({ onImageSelected }) {
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  return <div className="border-2 border-dashed border-blue-200 bg-blue-50/40 hover:bg-blue-50 p-6 rounded-xl text-center space-y-2 cursor-pointer transition-colors">
      <Upload className="w-8 h-8 mx-auto text-blue-500" />
      <span className="text-xs font-bold text-slate-700 block">Upload Cover Photo</span>
      <span className="text-[10px] text-slate-400 block">PNG or JPG up to 5MB</span>
      <input type="file" accept="image/*" onChange={handleFile} className="hidden" id="ai-cover-upload" />
      <label htmlFor="ai-cover-upload" className="inline-block mt-2 px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg cursor-pointer">
        Select Photo
      </label>
    </div>;
}
export {
  BookImageUpload
};
