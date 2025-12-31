import React, { useRef, useMemo, useCallback, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { uploadFile } from "../../controllers/commonController";
import { useDispatch } from "react-redux";
import { addToast } from "../../store/slices/ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export function RichTextEditor({ value, onChange, placeholder, readOnly, height = "300px" }) {
	const quillRef = useRef(null);
	const [isUploading, setIsUploading] = useState(false);
	const dispatch = useDispatch();

	// Custom Image Handler
	const imageHandler = useCallback(() => {
		const input = document.createElement("input");
		input.setAttribute("type", "file");
		input.setAttribute("accept", "image/*");
		input.click();

		input.onchange = async () => {
			const file = input.files[0];
			if (file) {
				setIsUploading(true);
				try {
					// Show uploading toast or some indication if needed,
					// but for now we just rely on the async wait.
					const res = await uploadFile(file);

					if (res.ok) {
						// Determine the URL from the response
						// Adapting to common API patterns: data.url or data.fullurl or just data if it's a string
						const url = res.data?.data?.fullurl || res.data?.fullurl || res.data?.url || res.data;

						if (url && typeof url === "string") {
							const quill = quillRef.current.getEditor();
							const range = quill.getSelection(true);
							quill.insertEmbed(range.index, "image", url);
						} else {
							dispatch(addToast({ type: "error", message: "Upload successful but no URL returned" }));
						}
					} else {
						dispatch(addToast({ type: "error", message: res.error?.message || "Image upload failed" }));
					}
				} catch (error) {
					console.error("Image upload error:", error);
					dispatch(addToast({ type: "error", message: "Image upload failed" }));
				} finally {
					setIsUploading(false);
				}
			}
		};
	}, [dispatch]);

	const modules = useMemo(
		() => ({
			toolbar: {
				container: [
					[{ header: [1, 2, 3, false] }],
					["bold", "italic", "underline", "strike", "blockquote"],
					[{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
					["link", "image"],
					["clean"],
				],
				handlers: {
					image: imageHandler,
				},
			},
			clipboard: {
				matchVisual: false,
			},
		}),
		[imageHandler]
	);

	const formats = ["header", "bold", "italic", "underline", "strike", "blockquote", "list", "bullet", "indent", "link", "image"];

	return (
		<div className="rich-text-editor relative">
			{isUploading && (
				<div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-lg transition-all duration-300">
					<div className="flex flex-col items-center justify-center p-6 bg-white shadow-2xl rounded-2xl border border-gray-100 transform scale-100 animate-scale-in">
						<FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-indigo-600 mb-3" />
						<span className="text-sm text-gray-600 font-semibold tracking-wide">Uploading...</span>
					</div>
				</div>
			)}
			<ReactQuill
				ref={quillRef}
				theme="snow"
				value={value || ""}
				onChange={onChange}
				modules={modules}
				formats={formats}
				placeholder={placeholder}
				readOnly={readOnly}
				style={{ height }} // Add margin bottom for toolbar space if needed, or just let it flow
			/>
            <style>{`
                .ql-editor {
					height: 100%;
                    font-size: 14px;
                }
                .ql-container {
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
					height: calc(100% - 46px) !important;
                }
                .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                }
                /* Disable editing when readOnly */
                .quill.read-only .ql-toolbar {
                    display: none;
                }
                .quill.read-only .ql-container {
                    border-top: 1px solid #ccc; /* Restore top border if toolbar is hidden */
                    border-radius: 0.5rem;
                }
            `}</style>
		</div>
	);
}
