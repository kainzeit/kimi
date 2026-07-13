import { useState } from "react";
import { Upload, Loader2, X } from "lucide-react";

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{ id: string; url: string }[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedImages([...uploadedImages, { id: Date.now().toString(), url: data.url }]);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = (id: string) => {
    setUploadedImages(uploadedImages.filter((img) => img.id !== id));
  };

  return (
    <div className="p-12 h-full flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-8">upload images</h2>

          {/* Upload Area */}
          <label className="block border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary transition mb-8">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-4">
              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <p className="text-muted-foreground">click to upload image</p>
                </>
              )}
            </div>
          </label>

          {/* Images Grid */}
          {uploadedImages.length === 0 ? (
            <p className="text-muted-foreground text-center">no images yet</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {uploadedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt="uploaded"
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
