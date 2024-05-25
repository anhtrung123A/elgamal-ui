import { useEffect, useState } from "react"
import * as mammoth from 'mammoth'

function App() {
  const url = 'http://localhost:8080/api/v1/'
  const [keyPair, setKeyPair] = useState(null)
  const [text, setText] = useState("")
  const [signature, setSignature] = useState()
  const [hashedText, setHashedText] = useState("")
  const [signatureText, setSignatureText] = useState("")
  const [filename, setFileName] = useState("Chọn file")
  const [filename1, setFileName1] = useState("Chọn file")
  const [filename2, setFileName2] = useState("Chọn file")
  const [receivedText, setReceivedText] = useState("")
  const [receivedSignature, setReceivedSignature] = useState()
  const [receivedSignatureText, setReceivedSignatureText] = useState("")
  const [receivedHashedText, setReceivedHashedText] = useState("")
  const [notification, setNotification] = useState("")
  const getKeyPair = () => {
    fetch(url + 'get-key-pair')
    .then(response => {
      return response.json()
    }).then(response => {
      setKeyPair(response)
      alert(JSON.stringify(response))
    })
  }
  const fileUpload = (event) => {
    const file = event.target.files[0]
    const extension = file.name.split(".")[file.name.split(".").length - 1]
    const reader = new FileReader()
    if (extension === 'txt'){
      reader.onload = () => {
        setText(reader.result)
      }
      reader.readAsText(file)
      if (document.getElementById("text-container").children.length != 1){
        document.getElementById("text-container").removeChild(document.getElementById("text-container").children[1])
        document.getElementById("text").classList.remove("hidden")
        document.getElementById("text-container").classList.remove("p-[15px]")
      }
    }
    else if (extension === 'docx') {
      extractDocxFile(file)
      reader.onload = () => {
        extractDocxFileTxt(reader.result)
      }
      reader.readAsArrayBuffer(file)
    }
    setFileName(file.name)
  }
  const extractDocxFileTxt = (arrayBuffer) => {
    mammoth.extractRawText({arrayBuffer: arrayBuffer}).then(function(result){
      setText(result.value)
  }).catch(function(err){
      console.log(err);
  })
  }
  const extractDocxFileTxt_ = (arrayBuffer) => {
    mammoth.extractRawText({arrayBuffer: arrayBuffer}).then(function(result){
      setReceivedText(result.value)
  }).catch(function(err){
      console.log(err);
  })
  }
  const fileUpload_ = (event) => {
    const file = event.target.files[0]
    const reader = new FileReader()
    const extension = file.name.split(".")[file.name.split(".").length - 1]
    if (extension === 'txt'){
      reader.onload = () => {
        setReceivedText(reader.result)
      }
      reader.readAsText(file)
      if (document.getElementById("received-text-container").children.length != 1){
        document.getElementById("received-text-container").removeChild(document.getElementById("received-text-container").children[1])
        document.getElementById("received-text").classList.remove("hidden")
        document.getElementById("received-text-container").classList.remove("p-[15px]")
      }
    }
    else if (extension === 'docx'){
      extractDocxFile_(file)
      reader.onload = () => {
        extractDocxFileTxt_(reader.result)
      }
      reader.readAsArrayBuffer(file)
    }
    setFileName1(file.name)

  }
  const fileUpload__ = (event) => {
    const file = event.target.files[0]
    const reader = new FileReader()
    const extension = file.name.split(".")[file.name.split(".").length - 1]
    if (extension === 'txt'){
      reader.onload = () => {
        setReceivedSignatureText(reader.result)
      }
      reader.readAsText(file)
    }
    setFileName2(file.name)

  }
  const sign = () => {
    if(keyPair != null) {
      fetch(url + 'get-signature', 
      { headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
        method: 'POST',
        body: JSON.stringify({"text": text, "keyPair": keyPair})
      })
      .then(response => {
      return response.json()
      })
      .then(response => {
      setSignature({s1: response.s1, s2: response.s2})
      setHashedText(response.hashedText)
      setSignatureText(JSON.stringify({s1: response.s1, s2: response.s2}))
    })
    }
    else {
      alert("Chưa có khóa")
    }
  }
  const send = () => {
    setReceivedText(text)
    setReceivedSignatureText(JSON.stringify(signature))
    setReceivedSignature(signature)
    setReceivedHashedText(hashedText)
    if (document.getElementById("text-container").children.length != 1){
      const toCloneNode = document.getElementById("text-container").children[1]
      document.getElementById("received-text").classList.add("hidden")
      if (document.getElementById("received-text-container").children.length != 1){
        document.getElementById("received-text-container").removeChild(document.getElementById("received-text-container").children[1])
      }
      const clone = toCloneNode.cloneNode(true)
      document.getElementById("received-text-container").appendChild(clone)
    }
  }
  const downloadFile = () => {
    const link = document.createElement("a");
    const file = new Blob([signatureText], { type: 'text/plain' });
    link.href = URL.createObjectURL(file);
    link.download = "signature.txt";
    link.click();
    URL.revokeObjectURL(link.href);
 };
 const getHashed = () => {
  fetch(url + 'get-hashed', 
      { headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
        method: 'POST',
        body: receivedText
      })
      .then(response => {
      return response.text()
      })
      .then(response => {
      setReceivedHashedText(response)
    })
 }
 const extractDocxFile_ = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  fetch('http://localhost:8080/api/v1/get-html', {
      method: 'POST',
      body: formData
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.text();
  })
  .then(data => {
    if (document.getElementById("received-text-container").children.length != 1){
      document.getElementById("received-text-container").removeChild(document.getElementById("received-text-container").children[1])
      document.getElementById("received-text").classList.remove("hidden")
      document.getElementById("received-text-container").classList.remove("p-[15px]")
    }
    const para = document.createElement("div");
    para.innerHTML = data
    para.classList.add("text-[14px]")
    document.getElementById('received-text-container').append(para)
    document.getElementById('received-text-container').classList.add("p-[15px]")
    document.getElementById('received-text').classList.add("hidden")
  })
  .catch(error => {
      console.error('Error uploading file:', error);
  });
}
 const extractDocxFile = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  fetch('http://localhost:8080/api/v1/get-html', {
      method: 'POST',
      body: formData
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.text();
  })
  .then(data => {
    if (document.getElementById("text-container").children.length != 1){
      document.getElementById("text-container").removeChild(document.getElementById("text-container").children[1])
      document.getElementById("text").classList.remove("hidden")
      document.getElementById("text-container").classList.remove("p-[15px]")
    }
    const para = document.createElement("div");
    para.innerHTML = data
    para.classList.add("text-[14px]")
    document.getElementById('text-container').append(para)
    document.getElementById('text-container').classList.add("p-[15px]")
    document.getElementById('text').classList.add("hidden")
  })
  .catch(error => {
      console.error('Error uploading file:', error);
  });
}
 const verify = () => {
  if(keyPair != null) {
    fetch(url + 'verify-signature', 
    { headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
      method: 'POST',
      body: JSON.stringify({text: receivedText, elGamalSignature: JSON.parse(receivedSignatureText), publicKey: keyPair.publicKey})
    })
    .then(async response =>  {
      return await response.json().then(content => ({ status: response.status, content }));
    })
    .then(response => {
    if (response.content == true){
      setNotification("- Chữ ký đúng.\n- Thông tin không bị sửa đổi.")
    }
    else if (response.status != 200 || response.content == false){
      if (receivedText != text && receivedSignatureText == signatureText) {
        setNotification("- Chữ ký đúng.\n- Thông tin đã bị sửa đổi.")
      }
      else if (receivedSignatureText != signatureText && receivedText == text){
        setNotification("- Chữ ký sai.\n- Thông tin không bị sửa đổi.")
      }
      else if (receivedSignatureText != signatureText && receivedText != text){
        setNotification("- Chữ ký sai.\n- Thông tin đã bị sửa đổi.")
      }
    }
  })
  }
  else {
    alert("Chưa có khóa")
  }
}

useEffect(()=>{
  if (receivedText != ""){
    getHashed()
  }
  else {
    setReceivedHashedText("")
  }
}, [receivedText])
  return (
    <main className="w-full h-[100vh] ">
      <div className="w-full h-[10%] flex flex-row  px-[15px] items-center border-b-[1px]">
        <button className="bg-[#282828] text-white px-[19px] py-[5px] text-[14px] rounded-[5px] cursor-pointer" onClick={()=>getKeyPair()}>Sinh khóa</button>
      </div>
      <div className="w-full h-[90%] flex">
        <div className="w-[50%] h-full py-[15px] px-[25px] flex flex-col gap-[3%]">
          <div className="w-full h-[5%] bg-white flex justify-center items-center">
            <p className="font-[500] tracking-[2px]">Phát sinh chữ ký</p>
          </div>
          <div className="w-full h-[35%] flex flex-col gap-[10px]">
            <p className="text-[16px] font-[500] tracking-[0.2px]">Văn bản ký</p>
            <div className="w-full h-full flex flex-row gap-[20px] items-start">
              <div id="text-container" className="w-[70%] rounded-[5px] bg-slate-100 h-[100%]">
                <textarea id="text" value={text} onChange={(event) => {
                  setText(event.target.value)
                  setHashedText("")
                  setSignatureText("")
                }} className="w-[100%] rounded-[5px] bg-slate-100 h-[100%] outline-none resize-none px-[10px] py-[5px] text-[14px]" placeholder="Abc..."></textarea>
              </div>
              <div className="flex flex-col gap-[10px] items-start">
                <div className="flex flex-row items-center gap-[12px] overflow-ellipsis">
                  <label htmlFor="file-input" className="bg-[#282828] text-[14px] rounded-[5px] text-white px-[15px] py-[5px] cursor-pointer">File</label>
                  <p className="text-[14px] tracking-[0.5px] overflow-hidden">{filename}</p>
                </div>
                <button className="bg-[#282828] rounded-[5px] text-[14px] text-white px-[19px] py-[5px] cursor-pointer" onClick={()=>{sign()}}>Ký</button>
              </div>
              <input type="file" className="hidden" id="file-input" name="file-input" accept=".docx,.txt" onChange={(event) => fileUpload(event)}/>
            </div>
          </div>
          <div className="w-full h-[15%] flex flex-col gap-[10px]">
            <p className="text-[16px] font-[500] tracking-[0.2px]">Hàm băm</p>
            <textarea value={hashedText} onChange={(event) => {setHashedText(event.target.value)}} className="w-[78%] text-[14px] rounded-[5px] bg-slate-100 h-[70%] outline-none resize-none px-[10px] py-[5px]" placeholder="..."></textarea>
          </div>
          <div className="w-full h-[30%] flex flex-col gap-[10px]">
            <p className="text-[16px] font-[500] tracking-[0.2px]">Chữ ký</p>
            <div className="h-full w-full flex flex-row gap-[20px]">
              <textarea value={signatureText} onChange={(event) => {setSignatureText(event.target.value)}} className="w-[70%] rounded-[5px] bg-slate-100 h-[80%] outline-none resize-none px-[10px] py-[5px]" placeholder="..."></textarea>
              <div className="flex flex-col items-start gap-[10px]">
                <button className="bg-[#282828] rounded-[5px] text-[14px] text-white px-[15px] py-[5px] cursor-pointer" onClick={()=>send()}>Chuyển</button>
                <button className="bg-[#282828] rounded-[5px] text-[14px] text-white px-[15px] py-[5px] cursor-pointer" onClick={()=>downloadFile()}>Lưu</button>
              </div>
            </div>
          </div>
        </div>
        <div className="w-[50%] h-full py-[15px] px-[25px] flex flex-col gap-[3%] border-l-[1px] ">
          <div className="w-full h-[5%] bg-white flex justify-center items-center">
            <p className="font-[500] tracking-[2px]">Kiểm tra chữ ký</p>
          </div>
          <div className="w-full h-[35%] flex flex-col gap-[10px]">
            <p className="text-[16px] font-[500] tracking-[0.2px]">Văn bản ký</p>
            <div className="w-full h-full flex flex-row gap-[20px] items-start">
            <div id="received-text-container" className="w-[70%] rounded-[5px] p-[15px] bg-slate-100 h-[100%]">
              <textarea id="received-text" value={receivedText} onChange={(event) => {setReceivedText(event.target.value)}} className="w-[70%] rounded-[5px] bg-slate-100 h-[100%] outline-none resize-none px-[10px] py-[5px] text-[14px]" placeholder="Abc..."></textarea>
            </div>
              <div className="flex flex-col gap-[10px] items-start">
                <div className="flex flex-row items-center gap-[12px]">
                  <label htmlFor="file-input-1" className="bg-[#282828]  rounded-[5px] text-[14px] text-white px-[15px] py-[5px] cursor-pointer">File</label>
                  <p className="text-[14px] tracking-[0.5px]">{filename1}</p>
                </div>
              </div>
              <input type="file" className="hidden" id="file-input-1" accept=".docx,.txt" name="file-input-1" onChange={(event)=>{fileUpload_(event)}}/>
            </div>
          </div>
          <div className="w-full h-[15%] flex flex-col gap-[10px]">
            <p className="text-[16px] font-[500] tracking-[0.2px]">Chữ ký</p>
            <div className="h-full w-full flex flex-row gap-[20px]">
              <textarea value={receivedSignatureText} onChange={(event) => {setReceivedSignatureText(event.target.value)}} className="w-[70%] rounded-[5px] bg-slate-100 h-[100%] outline-none resize-none px-[10px] py-[5px]" placeholder="..."></textarea>
              <div className="flex flex-col items-start gap-[10px]">
                <div className="flex flex-row items-center gap-[12px]">
                  <label htmlFor="file-input-2" className="bg-[#282828]  rounded-[5px] text-[14px] text-white px-[15px] py-[5px] cursor-pointer">File</label>
                  <p className="text-[14px] tracking-[0.5px]">{filename2}</p>
                </div>
                <input type="file" className="hidden" id="file-input-2" accept=".txt" name="file-input-2" onChange={(event)=>{fileUpload__(event)}}/>
                <button className="bg-[#282828] text-[14px] rounded-[5px] text-white px-[15px] py-[5px] cursor-pointer" onClick={()=>{verify()}}>Kiểm tra</button>
              </div>
            </div>
          </div>
          <div className="w-full h-[15%] flex flex-col gap-[10px]">
            <p className="text-[16px] font-[500] tracking-[0.2px]">Hàm băm</p>
            <textarea value={receivedHashedText} onChange={(event) => {setReceivedHashedText(event.target.value)}} className="w-[78%] text-[14px] rounded-[5px] bg-slate-100 h-[70%] outline-none resize-none px-[10px] py-[5px]" placeholder="..."></textarea>
          </div>
          <div className="w-full h-[15%] flex flex-col gap-[10px]">
            <p className="text-[16px] font-[500] tracking-[0.2px]">Thông báo</p>
            <textarea value={notification} readOnly className="w-[70%] text-[15px] whitespace-pre-line bg-slate-100 rounded-[5px] h-[70%] outline-none resize-none px-[10px] py-[5px]" placeholder="..."></textarea>
          </div>
        </div>
      </div>
    </main>
  )
}

export default App
