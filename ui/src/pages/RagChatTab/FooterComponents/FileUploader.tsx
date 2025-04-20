import React from "react";
import { Upload, Button, UploadProps, message } from "antd";
import { UploadOutlined  } from "@ant-design/icons";
import pdfToText from "react-pdftotext";
import { cdlBlue600 } from "src/cuix/variables.ts";

interface FileUploaderProps {
    takePdfText: (text: string) => void;
}

const FileUploader : React.FC<FileUploaderProps> = ({ takePdfText })=>{

    const props: UploadProps = {
        name: 'file',
        accept: '.pdf',
        beforeUpload: (file) => {

            const isPdf = file.type === 'application/pdf';
            if(isPdf) {
                pdfToText(file)
                .then((text : string) => {
                    console.log(text);
                    takePdfText(text);  
                })
                .catch((error : unknown) => {console.error("Failed to extract text from pdf: ", error)});
            }
            else{
                message.error("File is not a PDF: " + file.type);
            }
            return false; // Prevent automatic upload
        },
        onRemove: (file) => {
            console.log("File removed: ", file);
            takePdfText(""); // Clear the text when file is removed
        },
        maxCount: 1
    };

    
    return (
        <div>
            <Upload {...props}>
                <Button icon={<UploadOutlined  style={{ color: cdlBlue600 }} />} >Upload Service Requests <b>(PDF Only)</b></Button>
            </Upload>
        </div>
    );
}

export default FileUploader;