/**
 * v0 by Vercel.
 * @see https://v0.dev/t/aDFucFbMyb8
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"

export default function FileUpload({ setUrl, setOpenFile }: { setUrl: React.Dispatch<React.SetStateAction<string>>, setOpenFile: React.Dispatch<React.SetStateAction<boolean>> }) {

    const [file, setFile] = useState<File | null>(null);
    const [wait, setWait] = useState(true);

    async function uploadFile(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        var res
        if (file) {
            const formdata = new FormData();
            formdata.append("filename", file.name)
            formdata.append("file", file)
            res = await fetch("http://localhost:3000/uploadmedia", {
                method: "post",
                body: formdata,
            })
        }
        if (res?.status == 200) {
            const url = await res?.text()
            setUrl(url)
            setOpenFile(false)
        }
    }
    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files?.length > 0) {
            setFile(e.target.files[0])
            setWait(false)
        }
    }
    useEffect(() => {
        console.log(file)
    }, [file])
    return (
        <Card>
            <form onSubmit={uploadFile}>
                <CardContent className="p-6 space-y-4">
                    <div className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col gap-1 p-6 items-center">
                        <FileIcon className="w-12 h-12" />
                        <span className="text-sm font-medium text-gray-500">Drag and drop a file or click to browse</span>
                        <span className="text-xs text-gray-500">PDF, image, video, or audio</span>
                    </div>
                    <div className="space-y-2 text-sm">
                        <Label htmlFor="file" className="text-sm font-medium">
                            File
                        </Label>
                        <Input id="file" type="file" placeholder="File" onChange={handleFile} accept="image/*" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" size="lg" disabled={wait} className={wait ? `bg-muted-foreground` : ''}>Upload</Button>
                </CardFooter>
            </form>
        </Card>
    )
}

function FileIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        </svg>
    )
}