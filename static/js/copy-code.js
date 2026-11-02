/* Copy button on every code block. Injected client-side so RSS and
   llms-full.txt (which render .Content) stay free of button markup. */
(function(){
  if(!navigator.clipboard)return;
  document.querySelectorAll('main pre').forEach(function(pre){
    var code=pre.querySelector('code')||pre;
    var host=pre.parentElement;
    if(!host.classList.contains('highlight')){
      host=document.createElement('div');
      host.className='highlight';
      pre.parentNode.insertBefore(host,pre);
      host.appendChild(pre);
    }
    host.classList.add('has-copy');
    var btn=document.createElement('button');
    btn.type='button';
    btn.className='copy-code';
    btn.textContent='Copy';
    btn.setAttribute('aria-label','Copy code to clipboard');
    var timer;
    btn.addEventListener('click',function(){
      navigator.clipboard.writeText(code.innerText.replace(/\n$/,'')).then(function(){
        btn.textContent='Copied';
      },function(){
        btn.textContent='Failed';
      }).then(function(){
        clearTimeout(timer);
        timer=setTimeout(function(){btn.textContent='Copy';},1800);
      });
    });
    host.appendChild(btn);
  });
})();
