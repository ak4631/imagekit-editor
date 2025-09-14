"use client"

import {
    ImageKitAbortError,
    ImageKitInvalidRequestError,
    ImageKitServerError,
    ImageKitUploadNetworkError,
    upload,
} from "@imagekit/next";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const ImageKitUpload = () => {
    const [progress, setProgress] = useState(0);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [urlInput, setUrlInput] = useState<string>("");
    const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
    const [isUploading, setIsUploading] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortController = new AbortController();
    const router = useRouter();
    
    const authenticator = async () => {
        try {
            const response = await fetch("/api/upload_auth");
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Request failed with status ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            const { signature, expire, token, publicKey } = data;
            return { signature, expire, token, publicKey };
        } catch (error) {
            console.error("Authentication error:", error);
            throw new Error("Authentication request failed");
        }
    };

    const handleUpload = async () => {
        const fileInput = fileInputRef.current;
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            alert("Please select a file to upload");
            return;
        }

        setIsUploading(true);
        const file = fileInput.files[0];

        let authParams;
        try {
            authParams = await authenticator();
        } catch (authError) {
            console.error("Failed to authenticate for upload:", authError);
            setIsUploading(false);
            return;
        }
        const { signature, expire, token, publicKey } = authParams;

        try {
            const uploadResponse = await upload({
                expire,
                token,
                signature,
                publicKey,
                file,
                fileName: file.name, 
                onProgress: (event) => {
                    setProgress((event.loaded / event.total) * 100);
                },
                abortSignal: abortController.signal,
            });
            console.log("Upload response:", uploadResponse);
            let url = uploadResponse?.url ? uploadResponse?.url : "";
            setImageUrl(url);
        } catch (error) {
            if (error instanceof ImageKitAbortError) {
                console.error("Upload aborted:", error.reason);
            } else if (error instanceof ImageKitInvalidRequestError) {
                console.error("Invalid request:", error.message);
            } else if (error instanceof ImageKitUploadNetworkError) {
                console.error("Network error:", error.message);
            } else if (error instanceof ImageKitServerError) {
                console.error("Server error:", error.message);
            } else {
                console.error("Upload error:", error);
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleUrlSubmit = () => {
        if (urlInput.trim()) {
            setImageUrl(urlInput.trim());
        } else {
            alert("Please enter a valid image URL");
        }
    };

    const handleEdit = () => {
        if (imageUrl) {
            router.push(`/edit?imageUrl=${encodeURIComponent(imageUrl)}`);
        }
    };

    const resetImage = () => {
        setImageUrl("");
        setUrlInput("");
        setProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Image Editor
                    </h1>
                    <p className="text-lg text-gray-600">
                        Upload an image or provide a URL to start editing
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                    {!imageUrl ? (
                        <>
                            {/* Tab Navigation */}
                            <div className="flex mb-8 bg-gray-100 rounded-xl p-1">
                                <button
                                    onClick={() => setActiveTab('upload')}
                                    className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                        activeTab === 'upload'
                                            ? 'bg-white text-blue-600 shadow-md'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    📁 Upload Image
                                </button>
                                <button
                                    onClick={() => setActiveTab('url')}
                                    className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                        activeTab === 'url'
                                            ? 'bg-white text-blue-600 shadow-md'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    🔗 Image URL
                                </button>
                            </div>

                            {/* Upload Tab */}
                            {activeTab === 'upload' && (
                                <div className="space-y-6">
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors duration-200">
                                        <div className="mb-4">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            className="hidden"
                                            id="file-upload"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const label = document.querySelector('label[for="file-upload"] .file-name');
                                                    if (label) {
                                                        label.textContent = file.name;
                                                    }
                                                }
                                            }}
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            <span className="text-lg font-medium text-gray-700">
                                                Click to select an image
                                            </span>
                                            <div className="file-name text-sm text-gray-500 mt-2">
                                                or drag and drop your file here
                                            </div>
                                        </label>
                                        <p className="text-xs text-gray-500 mt-2">
                                            PNG, JPG, GIF up to 10MB
                                        </p>
                                    </div>

                                    {progress > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-700">Upload Progress</span>
                                                <span className="text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleUpload}
                                        disabled={isUploading}
                                        className={`w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all duration-200 ${
                                            isUploading
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                                        }`}
                                    >
                                        {isUploading ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                Uploading...
                                            </div>
                                        ) : (
                                            '📤 Upload Image'
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* URL Tab */}
                            {activeTab === 'url' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Image URL
                                        </label>
                                        <input
                                            type="url"
                                            value={urlInput}
                                            onChange={(e) => setUrlInput(e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">
                                            Enter a direct link to an image file
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleUrlSubmit}
                                        className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                                    >
                                        🔗 Use Image URL
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Image Preview and Edit Section */
                        <div className="text-center space-y-6">
                            <div className="relative inline-block">
                                <img
                                    src={imageUrl}
                                    alt="Selected image"
                                    className="max-w-full max-h-96 rounded-xl shadow-lg"
                                    onError={() => {
                                        alert("Failed to load image. Please check the URL or try a different image.");
                                        resetImage();
                                    }}
                                />
                                <button
                                    onClick={resetImage}
                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors duration-200"
                                    title="Remove image"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <p className="text-lg text-gray-600">
                                    🎉 Image loaded successfully!
                                </p>
                                
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={handleEdit}
                                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                                    >
                                        ✨ Edit Image
                                    </button>
                                    
                                    <button
                                        onClick={resetImage}
                                        className="px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                                    >
                                        🔄 Choose Another
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-sm text-gray-500">
                        Supports JPG, PNG, GIF formats • Maximum file size: 10MB
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ImageKitUpload;