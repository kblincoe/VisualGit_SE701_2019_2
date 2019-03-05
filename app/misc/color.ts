let cs = require('color-scheme');
let before = 'default';;
function changeColor(color) {
  // let scheme = new cs;
  // scheme.from_hue(0)
  //     .scheme('mono')
  //     .variation('soft');
  // let colors = scheme.colors();
  // for (let i = 0; i < colors.length; i++) {
  //   console.log(colors[i]);
  // }
  console.log(color + '   ' + (color === 'white'));
  let head = document.getElementsByClassName('navbar');
  let headButton = document.getElementsByClassName('navbar-btn');
  let fa = document.getElementsByClassName('fa');
  let fp = document.getElementById('file-panel');
  let p = document.getElementsByTagName('p');
  let h1 = document.getElementsByTagName('h1');
  let diffp = document.getElementById('diff-panel-body');
  let network = document.getElementById('my-network');
  let footer = document.getElementById('footer');
  let arp = document.getElementById('add-repository-panel');
  let auth = document.getElementById('authenticate');
  if (color === 'white') {
    for (let i = 0; i < head.length; i++) {
      console.log(head[i]);
      head[i].className = 'navbar navbar-white';
    }
    for (let i = 0; i < headButton.length; i++) {
      if (before === 'default') {
        headButton[i].classList.remove('btn-inverse');
      }
      headButton[i].classList.add('btn-default');
    }
    for (let i = 0; i < fa.length; i++) {
      fa[i].setAttribute('style', 'color:#a8abaf');
    }

    fp.setAttribute('style', 'background-color:#E3E3E3');

    for (let i = 0; i < p.length; i++) {
      p[i].style.color = 'black';
    }
    for (let i = 0; i < h1.length; i++) {
      h1[i].style.color = '#5E5E5E';
    }

    diffp.style.color = '#D2D3D4';
    diffp.style.backgroundColor = '#616161';
    network.style.backgroundColor = '#D6D6D6';
    footer.style.backgroundColor = '#E3E3E3';
    arp.style.backgroundColor = '#D1D1D1';
    auth.style.backgroundColor = '#D6D6D6';
    before = 'white';
  }
  else if (color === 'pink') {
    for (var i = 0; i < head.length; i++) {
            console.log(head[i]);
            head[i].className = 'navbar navbar-pink';
        }
        for (var i = 0; i < headButton.length; i++) {
            if (before === 'default') {
                headButton[i].classList.remove('btn-inverse');
            }
            headButton[i].classList.add('btn-default');
        }
        for (var i = 0; i < fa.length; i++) {
            fa[i].setAttribute('style', 'color:white'); 
        }
        fp.setAttribute('style', 'background-color: #FFC2C2');
        for (var i = 0; i < p.length; i++) {
            p[i].style.color = '#767676'; 
        }
        for (var i = 0; i < h1.length; i++) {
            h1[i].style.color = '#FFA3A3'; 
        }
        diffp.style.color = 'white';
        diffp.style.backgroundColor = 'white';
        network.style.backgroundColor = '#FFE5E5';
        footer.style.backgroundColor = '#FFD7D7'; 
        footer.style.border = '#FFD7D7';
        arp.style.backgroundColor = '#FFD7D7';
        auth.style.backgroundColor = '#FFE5E5';
        before = 'pink';
    }
    else if (color === 'blue') {
      for (var i = 0; i < head.length; i++) {
              console.log(head[i]);
              head[i].className = 'navbar navbar-blue';
          }
          for (var i = 0; i < headButton.length; i++) {
              if (before === 'default') {
                  headButton[i].classList.remove('btn-inverse');
              }
              headButton[i].classList.add('btn-default');
          }
          for (var i = 0; i < fa.length; i++) {
              fa[i].setAttribute('style', 'color:white'); 
          }
          fp.setAttribute('style', 'background-color: #9DD2FE'); 
          for (var i = 0; i < p.length; i++) {
              p[i].style.color = '#767676'; 
          }
          for (var i = 0; i < h1.length; i++) {
              h1[i].style.color = '#4EAFFE'; 
          }
          diffp.style.color = 'white'; 
          diffp.style.backgroundColor = 'white'; 
          network.style.backgroundColor = '#EEF6FF'; 
          footer.style.backgroundColor = '#B6DEFF'; 
          footer.style.border = '#B6DEFF'; 
          arp.style.backgroundColor = '#DAEEFF'; 
          auth.style.backgroundColor = '#DAEEFF'; 
          before = 'blue';
    }
    else if (color === 'navy') {
      for (var i = 0; i < head.length; i++) {
              console.log(head[i]);
              head[i].className = 'navbar navbar-navy';
          }
          for (var i = 0; i < headButton.length; i++) {
              if (before === 'default') {
                  headButton[i].classList.remove('btn-inverse');
              }
              headButton[i].classList.add('btn-default');
          }
          for (var i = 0; i < fa.length; i++) {
              fa[i].setAttribute('style', 'color:white');
          }
          fp.setAttribute('style', 'background-color: #0066FF'); 
          for (var i = 0; i < p.length; i++) {
              p[i].style.color = 'white';
          }
          for (var i = 0; i < h1.length; i++) {
              h1[i].style.color = '#001C83';
          }
          diffp.style.color = 'white'; 
          diffp.style.backgroundColor = 'white';
          network.style.backgroundColor = '#CCE0FF'; 
          network.style.border = '#CCE0FF';
          footer.style.backgroundColor = '#4D94FF'; 
          footer.style.border = '#4D94FF'; 
          arp.style.backgroundColor = '#4D94FF'; 
          auth.style.backgroundColor = '#4D94FF'; 
          before = 'navy';
    }
    else if (color === 'green') {
      for (var i = 0; i < head.length; i++) {
              console.log(head[i]);
              head[i].className = 'navbar navbar-green';
          }
          for (var i = 0; i < headButton.length; i++) {
              if (before === 'default') {
                  headButton[i].classList.remove('btn-inverse');
              }
              headButton[i].classList.add('btn-default');
          }
          for (var i = 0; i < fa.length; i++) {
              fa[i].setAttribute('style', 'color:white'); 
          }
          fp.setAttribute('style', 'background-color: #5CD65C'); 
          for (var i = 0; i < p.length; i++) {
              p[i].style.color = 'white'; 
          }
          for (var i = 0; i < h1.length; i++) {
              h1[i].style.color = '#00990d'; 
          }
          diffp.style.color = 'white'; 
          diffp.style.backgroundColor = 'white'; 
          network.style.backgroundColor = '#EBFAEB'; 
          footer.style.backgroundColor = '#ADEBAD'; 
          footer.style.border = '#ADEBAD'; 
          arp.style.backgroundColor = '#ADEBAD'; 
          auth.style.backgroundColor = '#ADEBAD'; 
          before = 'green';
  } 
  else if (color === 'default') {
    for (let i = 0; i < head.length; i++) {
      console.log(head[i]);
      head[i].className = 'navbar navbar-inverse';
    }
    for (let i = 0; i < headButton.length; i++) {
      if (before === 'default') {
        headButton[i].classList.remove('btn-default');
      }
      headButton[i].classList.add('btn-inverse');
    }
    for (let i = 0; i < fa.length; i++) {
      fa[i].setAttribute('style', 'color:white');
    }

    fp.setAttribute('style', 'background-color:#282828');

    for (let i = 0; i < p.length; i++) {
      p[i].style.color = '#ccc';
    }
    for (let i = 0; i < h1.length; i++) {
      h1[i].style.color = '#ccc';
    }

    diffp.style.color = '#fff';
    diffp.style.backgroundColor = '#282828';
    network.style.backgroundColor = '#181818';
    footer.style.backgroundColor = '#282828';
    arp.style.backgroundColor = '#282828';
    auth.style.backgroundColor = '#282828';
    before = 'default';
  }
}
