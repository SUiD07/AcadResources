import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/button";

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
}

export function ResourceImageUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const filePath = `resources/${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage
        .from("resource-images")
        .upload(filePath, file, { upsert: false });

      if (error) throw error;

      const { data } = supabase.storage
        .from("resource-images")
        .getPublicUrl(filePath);

      onChange(data.publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-slate-200">
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 bg-white/90 rounded-full p-1 hover:bg-white"
          >
            <X className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-24 border-dashed"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-slate-500 text-sm">
              <Upload className="w-5 h-5" /> อัปโหลดรูปภาพ
            </span>
          )}
        </Button>
      )}
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
    </div>
  );
}