(() => {
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  function attach(root){
    if(!root)return;
    root.querySelectorAll('input:not([type="time"]):not([type="number"]):not([type="date"]),textarea').forEach(field=>{
      if(field.parentElement.classList.contains('field-with-mic')){
        if(field.parentElement.querySelector('.dictate-btn'))return;
      }else{
        const wrap=document.createElement('div');wrap.className='field-with-mic';field.parentNode.insertBefore(wrap,field);wrap.appendChild(field);
      }
      const wrap=field.parentElement,button=document.createElement('button');button.type='button';button.className='dictate-btn';button.title=Recognition?'Dictate':'Dictation is not supported in this browser';button.textContent='◉';
      if(!Recognition){button.disabled=true;wrap.classList.add('dictation-unavailable')}
      else button.onclick=()=>{const recognition=new Recognition();recognition.lang='en-US';recognition.interimResults=false;recognition.onstart=()=>{button.classList.add('listening');button.textContent='●'};recognition.onend=()=>{button.classList.remove('listening');button.textContent='◉'};recognition.onerror=()=>window.toast&&toast('Dictation could not start here.');recognition.onresult=event=>{const text=Array.from(event.results).map(result=>result[0].transcript).join(' ');field.value=(field.value?field.value+' ':'')+text;field.dispatchEvent(new Event('input',{bubbles:true}))};recognition.start()};
      wrap.appendChild(button);
    });
  }
  attach(document);const modalBody=document.querySelector('#modalBody');if(modalBody)new MutationObserver(()=>attach(modalBody)).observe(modalBody,{childList:true,subtree:true});
})();
