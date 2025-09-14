import React, { useState, useEffect } from "react";
import { Copy, RotateCw, Download, Eye, EyeOff, Settings, Image, Palette, Zap, Move3D } from "lucide-react";

interface TransformationParams {
  height?: string;
  width?: string;
  aspectRatio?: string;
  quality?: string;
  format?: string;
  rotation?: string;
  crop?: string;
  focus?: string;
  blur?: string;
  sharpen?: string;
  brightness?: string;
  contrast?: string;
  saturation?: string;
  hue?: string;
  gamma?: string;
  radius?: string;
  border?: string;
  borderColor?: string;
  grayscale?: boolean;
  sepia?: boolean;
  progressive?: boolean;
  lossless?: boolean;
}

const ImageKitTransformer = ({ imageurl }: any) => {
  const [imageUrl, setImageUrl] = useState(imageurl);
  const [transformations, setTransformations] = useState<TransformationParams>({});
  const [transformedUrl, setTransformedUrl] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'effects' | 'colors' | 'advanced'>('basic');
  const [previewMode, setPreviewMode] = useState<'split' | 'overlay'>('split');
  const [showOriginal, setShowOriginal] = useState(true);

  const generateTransformationString = () => {
    const params: string[] = [];

    // Basic transformations
    if (transformations.height) params.push(`h-${transformations.height}`);
    if (transformations.width) params.push(`w-${transformations.width}`);
    if (transformations.aspectRatio) params.push(`ar-${transformations.aspectRatio}`);
    if (transformations.quality) params.push(`q-${transformations.quality}`);
    if (transformations.format) params.push(`f-${transformations.format}`);
    if (transformations.rotation) params.push(`rt-${transformations.rotation}`);
    if (transformations.crop) params.push(`c-${transformations.crop}`);
    if (transformations.focus) params.push(`fo-${transformations.focus}`);
    
    // Effects
    if (transformations.blur) params.push(`bl-${transformations.blur}`);
    if (transformations.sharpen) params.push(`e-sharpen-${transformations.sharpen}`);
    if (transformations.radius) params.push(`r-${transformations.radius}`);
    if (transformations.border) params.push(`b-${transformations.border}_${transformations.borderColor || '000000'}`);
    
    // Colors
    if (transformations.brightness) params.push(`e-brightness-${transformations.brightness}`);
    if (transformations.contrast) params.push(`e-contrast-${transformations.contrast}`);
    if (transformations.saturation) params.push(`e-saturation-${transformations.saturation}`);
    if (transformations.hue) params.push(`e-hue-${transformations.hue}`);
    if (transformations.gamma) params.push(`e-gamma-${transformations.gamma}`);
    if (transformations.grayscale) params.push(`e-grayscale`);
    if (transformations.sepia) params.push(`e-sepia`);
    
    // Advanced
    if (transformations.progressive) params.push(`pr-true`);
    if (transformations.lossless) params.push(`lo-true`);

    return params.length > 0 ? `tr:${params.join(",")}` : "";
  };

  useEffect(() => {
    const transformString = generateTransformationString();
    if (transformString && imageUrl) {
      let cleanUrl = imageUrl.split("?")[0];
      const urlParams = new URLSearchParams(imageUrl.split("?")[1] || "");
      urlParams.delete("tr");
      urlParams.set("tr", transformString.replace("tr:", ""));
      setTransformedUrl(`${cleanUrl}?${urlParams.toString()}`);
    } else {
      setTransformedUrl(imageUrl);
    }
  }, [transformations, imageUrl]);

  const updateTransformation = (key: keyof TransformationParams, value: string | boolean) => {
    setTransformations((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transformedUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const resetTransformations = () => {
    setTransformations({});
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = transformedUrl;
    link.download = `transformed-image.${transformations.format || 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const transformationCount = Object.values(transformations).filter((v) => v).length;

  const TabButton = ({ id, icon: Icon, label, isActive }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
        isActive
          ? 'bg-white text-blue-600 shadow-lg border-2 border-blue-100'
          : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  const SliderInput = ({ label, value, onChange, min = 0, max = 100, step = 1 }: any) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          {value || 0}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value || 0}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ImageKit Editor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your images with powerful URL-based transformations. Real-time preview with professional controls.
          </p>
        </div>

        {/* URL Input */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <label className="block text-lg font-semibold text-gray-800 mb-3">
            🔗 Image URL
          </label>
          <div className="relative">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter your ImageKit URL here..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            <div className="absolute right-3 top-3 text-gray-400">
              <Image className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Controls Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Settings className="w-6 h-6 mr-3" />
                    <h2 className="text-xl font-bold">Transformations</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 text-sm rounded-full bg-white/20">
                      {transformationCount} active
                    </span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="p-4 bg-gray-50 border-b">
                <div className="grid grid-cols-2 gap-2">
                  <TabButton id="basic" icon={Settings} label="Basic" isActive={activeTab === 'basic'} />
                  <TabButton id="effects" icon={Zap} label="Effects" isActive={activeTab === 'effects'} />
                  <TabButton id="colors" icon={Palette} label="Colors" isActive={activeTab === 'colors'} />
                  <TabButton id="advanced" icon={Move3D} label="Advanced" isActive={activeTab === 'advanced'} />
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                {activeTab === 'basic' && (
                  <>
                    {/* Dimensions */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-blue-700 flex items-center">
                        <Move3D className="w-4 h-4 mr-2" />
                        Dimensions
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-2">Width (px)</label>
                          <input
                            value={transformations.width || ""}
                            onChange={(e) => updateTransformation("width", e.target.value)}
                            placeholder="400"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Height (px)</label>
                          <input
                            value={transformations.height || ""}
                            onChange={(e) => updateTransformation("height", e.target.value)}
                            placeholder="300"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Aspect Ratio & Crop */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
                        <select
                          value={transformations.aspectRatio || ""}
                          onChange={(e) => updateTransformation("aspectRatio", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Custom</option>
                          <option value="1-1">1:1 Square</option>
                          <option value="4-3">4:3 Standard</option>
                          <option value="16-9">16:9 Widescreen</option>
                          <option value="3-2">3:2 Photo</option>
                          <option value="21-9">21:9 Ultra Wide</option>
                          <option value="9-16">9:16 Portrait</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Crop Mode</label>
                        <select
                          value={transformations.crop || ""}
                          onChange={(e) => updateTransformation("crop", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">No Cropping</option>
                          <option value="maintain_ratio">Maintain Ratio</option>
                          <option value="force">Force Dimensions</option>
                          <option value="at_least">At Least</option>
                          <option value="at_max">At Maximum</option>
                        </select>
                      </div>
                    </div>

                    {/* Focus & Rotation */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">Focus Point</label>
                        <select
                          value={transformations.focus || ""}
                          onChange={(e) => updateTransformation("focus", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Auto Focus</option>
                          <option value="center">Center</option>
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                          <option value="face">Face Detection</option>
                          <option value="auto">Smart Auto</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Rotation</label>
                        <select
                          value={transformations.rotation || ""}
                          onChange={(e) => updateTransformation("rotation", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">No Rotation</option>
                          <option value="90">90° Right</option>
                          <option value="180">180° Flip</option>
                          <option value="270">270° Left</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'effects' && (
                  <>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-purple-700 flex items-center">
                        <Zap className="w-4 h-4 mr-2" />
                        Visual Effects
                      </h3>
                      
                      <SliderInput
                        label="Blur Intensity"
                        value={transformations.blur}
                        onChange={(v: string) => updateTransformation("blur", v)}
                        min={0}
                        max={20}
                      />
                      
                      <SliderInput
                        label="Sharpen"
                        value={transformations.sharpen}
                        onChange={(v: string) => updateTransformation("sharpen", v)}
                        min={0}
                        max={10}
                      />
                      
                      <SliderInput
                        label="Border Radius"
                        value={transformations.radius}
                        onChange={(v: string) => updateTransformation("radius", v)}
                        min={0}
                        max={50}
                      />

                      <div>
                        <label className="block text-sm font-medium mb-2">Border Width</label>
                        <input
                          value={transformations.border || ""}
                          onChange={(e) => updateTransformation("border", e.target.value)}
                          placeholder="5"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Border Color</label>
                        <input
                          type="color"
                          value={`#${transformations.borderColor || "000000"}`}
                          onChange={(e) => updateTransformation("borderColor", e.target.value.substring(1))}
                          className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={transformations.grayscale || false}
                            onChange={(e) => updateTransformation("grayscale", e.target.checked)}
                            className="mr-2"
                          />
                          Grayscale
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={transformations.sepia || false}
                            onChange={(e) => updateTransformation("sepia", e.target.checked)}
                            className="mr-2"
                          />
                          Sepia
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'colors' && (
                  <>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-green-700 flex items-center">
                        <Palette className="w-4 h-4 mr-2" />
                        Color Adjustments
                      </h3>
                      
                      <SliderInput
                        label="Brightness"
                        value={transformations.brightness}
                        onChange={(v: string) => updateTransformation("brightness", v)}
                        min={-100}
                        max={100}
                      />
                      
                      <SliderInput
                        label="Contrast"
                        value={transformations.contrast}
                        onChange={(v: string) => updateTransformation("contrast", v)}
                        min={-100}
                        max={100}
                      />
                      
                      <SliderInput
                        label="Saturation"
                        value={transformations.saturation}
                        onChange={(v: string) => updateTransformation("saturation", v)}
                        min={-100}
                        max={100}
                      />
                      
                      <SliderInput
                        label="Hue Shift"
                        value={transformations.hue}
                        onChange={(v: string) => updateTransformation("hue", v)}
                        min={-180}
                        max={180}
                      />
                      
                      <SliderInput
                        label="Gamma"
                        value={transformations.gamma}
                        onChange={(v: string) => updateTransformation("gamma", v)}
                        min={0.1}
                        max={3}
                        step={0.1}
                      />
                    </div>
                  </>
                )}

                {activeTab === 'advanced' && (
                  <>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-indigo-700 flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Advanced Options
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Format</label>
                        <select
                          value={transformations.format || ""}
                          onChange={(e) => updateTransformation("format", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Auto Format</option>
                          <option value="auto">Smart Auto</option>
                          <option value="webp">WebP (Modern)</option>
                          <option value="avif">AVIF (Next-gen)</option>
                          <option value="jpg">JPEG (Standard)</option>
                          <option value="png">PNG (Lossless)</option>
                        </select>
                      </div>
                      
                      <SliderInput
                        label="Quality (%)"
                        value={transformations.quality}
                        onChange={(v: string) => updateTransformation("quality", v)}
                        min={1}
                        max={100}
                      />

                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={transformations.progressive || false}
                            onChange={(e) => updateTransformation("progressive", e.target.checked)}
                            className="mr-2"
                          />
                          Progressive
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={transformations.lossless || false}
                            onChange={(e) => updateTransformation("lossless", e.target.checked)}
                            className="mr-2"
                          />
                          Lossless
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-gray-50 border-t space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={resetTransformations}
                    className="flex-1 flex items-center justify-center border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-700 hover:bg-gray-100 transition-all duration-200"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Reset All
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className={`flex-1 flex items-center justify-center rounded-xl px-4 py-3 transition-all duration-200 ${
                      copySuccess
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                    }`}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copySuccess ? "Copied!" : "Copy URL"}
                  </button>
                </div>
                <button
                  onClick={downloadImage}
                  className="w-full flex items-center justify-center bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl px-4 py-3 hover:from-green-600 hover:to-teal-700 transition-all duration-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Preview Header */}
              <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="w-6 h-6 mr-3" />
                    <h2 className="text-xl font-bold">Live Preview</h2>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setPreviewMode(previewMode === 'split' ? 'overlay' : 'split')}
                      className="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium"
                    >
                      {previewMode === 'split' ? 'Split View' : 'Overlay View'}
                    </button>
                    <button
                      onClick={() => setShowOriginal(!showOriginal)}
                      className="p-2 bg-white/20 rounded-lg"
                    >
                      {showOriginal ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {imageUrl && imageUrl != "" && (
                <div className="p-6 space-y-6">
                  {/* Image Preview */}
                  <div className={`bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 min-h-[400px] flex items-center justify-center ${
                    previewMode === 'split' ? 'grid grid-cols-2 gap-4' : ''
                  }`}>
                    {showOriginal && previewMode === 'split' && (
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 mb-2">Original</p>
                        <img
                          src={imageUrl}
                          alt="Original"
                          className="max-w-full max-h-[300px] object-contain rounded-lg shadow-lg"
                        />
                      </div>
                    )}
                    <div className="text-center">
                      {previewMode === 'split' && <p className="text-sm font-medium text-gray-600 mb-2">Transformed</p>}
                      <img
                        src={transformedUrl}
                        alt="Transformed preview"
                        className="max-w-full max-h-[300px] object-contain rounded-lg shadow-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  </div>

                  {/* URL Display */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-800">
                      🔗 Generated URL
                    </label>
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                      <code className="text-xs font-mono text-gray-700 break-all leading-relaxed">
                        {transformedUrl}
                      </code>
                    </div>
                  </div>

                  {transformationCount > 0 && (
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-800">
                        ⚡ Transformation String
                      </label>
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                        <code className="text-sm font-mono text-blue-700">
                          {generateTransformationString()}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default ImageKitTransformer;