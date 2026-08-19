const themePreference=localStorage.getItem('daymark-theme')||'darkwood';
if(themePreference==='light')document.body.classList.add('light-mode');
const appearanceButton=document.querySelector('#appearanceBtn');
if(appearanceButton)appearanceButton.onclick=()=>{const light=document.body.classList.toggle('light-mode');localStorage.setItem('daymark-theme',light?'light':'darkwood');toast(light?'Light finish on.':'Darkwood finish on.');};
