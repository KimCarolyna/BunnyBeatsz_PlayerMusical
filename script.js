// =============================
// Script do Player - Versão corrigida
// Correção principal: remoção da duplicação de `addPlaylistBtn` no final do arquivo
// e garantia de execução após o DOM estar pronto.
// =============================

document.addEventListener("DOMContentLoaded", () => {
// =============================
// Elementos principais
// =============================
const audio        = document.querySelector("audio");
const btnPlay      = document.querySelector(".btn-play");
const btnPause     = document.querySelector(".btn-pause");
const btnNext      = document.querySelector(".btn-next");
const btnPrev      = document.querySelector(".btn-prev");
const btnLoop      = document.querySelector(".btn-loop");
const btnShuffle   = document.querySelector(".btn-shuffle");
const barra        = document.querySelector(".barra");
const tempoInicio  = document.querySelector(".inicio");
const tempoFim     = document.querySelector(".fim");
const capaImg      = document.querySelector(".capa-container"); // <img class="capa-container">
const nomeMusica   = document.querySelector(".nome-musica");
const nomeArtista  = document.querySelector(".nome-artista");

// Menu/overlay
const menuBtn      = document.getElementById("menu-btn");
const overlayLista = document.getElementById("lista-musicas");
const voltarBtn    = document.getElementById("voltar-btn");

// Listas
const todasListaEl     = document.getElementById("todas-lista");
let   musicasLista     = Array.from(todasListaEl ? todasListaEl.querySelectorAll("li") : []);
const favoritasListaEl = document.getElementById("favoritas-lista");

// Like principal
const likeBtn = document.querySelector(".like");

// =============================
// Estado
// =============================
let indexAtual   = 0;
let isLooping    = false;
let isShuffling  = false;
const favoritos  = new Set();

// =============================
// Util
// =============================
function formatarTempo(seg) {
  if (!isFinite(seg)) return "0:00";
  const m = Math.floor(seg / 60);
  const s = Math.floor(seg % 60);
  return `${m}:${s < 10 ? "0" + s : s}`;
}

function tituloDeLi(li) {
  return (li.textContent || "").replace("❤", "").trim();
}

function atualizarLikePrincipal() {
  const titulo = (nomeMusica?.textContent || "").trim();
  if (!likeBtn) return;
  likeBtn.src = favoritos.has(titulo) ? "imagens/like_cheio.png" : "imagens/like_vazio.png";
}

function setCapa(src) {
  if (!capaImg) return;
  if (capaImg.tagName && capaImg.tagName.toLowerCase() === "img") {
    capaImg.src = src || "";
  } else {
    capaImg.style.backgroundImage = src ? `url("${src}")` : "none";
  }
}

// =============================
// Carregar / Tocar
// =============================
function carregarMusica(index) {
  const li = musicasLista[index];
  if (!li) return;

  const src     = li.getAttribute("data-musica");
  const artista = li.getAttribute("data-artista") || "";
  const capa    = li.getAttribute("data-capa")    || "";
  const titulo  = tituloDeLi(li);

  if (audio) audio.src = src || "";
  if (nomeMusica)  nomeMusica.textContent  = titulo;
  if (nomeArtista) nomeArtista.textContent = artista;
  setCapa(capa);

  if (audio) audio.load();
  if (barra) barra.value = 0;
  if (tempoInicio) tempoInicio.textContent = "0:00";
  if (tempoFim)    tempoFim.textContent    = "0:00";

  atualizarLikePrincipal();
}

function tocar() {
  audio?.play().catch(()=>{});
  btnPlay && btnPlay.classList.add("hidden");
  btnPause && btnPause.classList.remove("hidden");
}

function pausar() {
  audio?.pause();
  btnPause && btnPause.classList.add("hidden");
  btnPlay && btnPlay.classList.remove("hidden");
}

function trocarMusica() {
  carregarMusica(indexAtual);
  tocar();
}

// =============================
// Eventos do <audio> e barra
// =============================
if (audio) {
  audio.addEventListener("loadedmetadata", () => {
    if (!barra) return;
    barra.max = Math.floor(audio.duration) || 0;
    if (tempoFim) tempoFim.textContent = formatarTempo(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration || !barra) return;
    const progresso = audio.currentTime / audio.duration;
    barra.value = Math.floor(progresso * (barra.max || 0));
    if (tempoInicio) tempoInicio.textContent = formatarTempo(audio.currentTime);

    const pct = (progresso * 100).toFixed(2);
    barra.style.background = `linear-gradient(90deg, #ff70a6 ${pct}%, #ffffff ${pct}%)`;
  });

  audio.addEventListener("ended", () => {
    if (audio.loop) return;
    btnNext?.click();
  });
}

barra?.addEventListener("input", () => {
  if (!audio?.duration) return;
  audio.currentTime = (barra.value / (barra.max || 1)) * audio.duration;
});

// =============================
// Botões do player
// =============================
btnPlay?.addEventListener("click", tocar);
btnPause?.addEventListener("click", pausar);

btnNext?.addEventListener("click", () => {
  if (!musicasLista.length) return;
  indexAtual = isShuffling
    ? Math.floor(Math.random() * musicasLista.length)
    : (indexAtual + 1) % musicasLista.length;
  trocarMusica();
});

btnPrev?.addEventListener("click", () => {
  if (!musicasLista.length) return;
  indexAtual = isShuffling
    ? Math.floor(Math.random() * musicasLista.length)
    : (indexAtual - 1 + musicasLista.length) % musicasLista.length;
  trocarMusica();
});

btnLoop?.addEventListener("click", () => {
  isLooping = !isLooping;
  if (audio) audio.loop = isLooping;
  btnLoop && (btnLoop.style.opacity = isLooping ? "1" : "0.5");
});

btnShuffle?.addEventListener("click", () => {
  isShuffling = !isShuffling;
  btnShuffle && (btnShuffle.style.opacity = isShuffling ? "1" : "0.5");
});

// =============================
// Abertura/fechamento da lista
// =============================
menuBtn?.addEventListener("click", () => {
  atualizarListaFavoritos();
  atualizarListaFavoritas();
  overlayLista?.classList.remove("hidden");
});

voltarBtn?.addEventListener("click", () => {
  overlayLista?.classList.add("hidden");
});

// =============================
// Clique nas músicas (Todas e Favoritas)
// =============================
todasListaEl?.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const idx = musicasLista.indexOf(li);
  if (idx < 0) return;
  indexAtual = idx;
  trocarMusica();
  overlayLista?.classList.add("hidden");
});

favoritasListaEl?.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const titulo = tituloDeLi(li);
  const idx = musicasLista.findIndex(item => tituloDeLi(item) === titulo);
  if (idx >= 0) {
    indexAtual = idx;
    trocarMusica();
    overlayLista?.classList.add("hidden");
  }
});

// =============================
// Like / Favoritos
// =============================
likeBtn?.addEventListener("click", () => {
  const tituloAtual = (nomeMusica?.textContent || "").trim();
  if (!tituloAtual) return;

  if (favoritos.has(tituloAtual)) {
    favoritos.delete(tituloAtual);
  } else {
    favoritos.add(tituloAtual);
  }

  likeBtn.classList.remove("animando");
  void likeBtn.offsetWidth;
  likeBtn.classList.add("animando");

  atualizarLikePrincipal();
  atualizarListaFavoritos();
  atualizarListaFavoritas();
});

function atualizarListaFavoritos() {
  musicasLista.forEach(li => {
    const antigo = li.querySelector(".favorito-icon");
    if (antigo) antigo.remove();
  });

  musicasLista.forEach(li => {
    const titulo = tituloDeLi(li);
    if (favoritos.has(titulo)) {
      const icone = document.createElement("img");
      icone.src = "imagens/like_cheio.png";
      icone.className = "favorito-icon";
      li.appendChild(icone);
    }
  });
}

function atualizarListaFavoritas() {
  if (!favoritasListaEl) return;
  favoritasListaEl.innerHTML = "";
  musicasLista.forEach(li => {
    const titulo = tituloDeLi(li);
    if (favoritos.has(titulo)) {
      const novo = document.createElement("li");
      novo.textContent = titulo;

      const icone = document.createElement("img");
      icone.src = "imagens/like_cheio.png";
      icone.className = "favorito-icon";
      novo.appendChild(icone);

      favoritasListaEl.appendChild(novo);
    }
  });
}

// =============================
// Abas (Todas / Favoritas / Playlists)
// =============================
const tabBtns = document.querySelectorAll(".tab-btn");
const containersPorAba = {
  todas: document.getElementById("todas-lista"),
  favoritas: document.getElementById("favoritas-lista"),
  playlists: document.getElementById("playlists-lista"),
};

tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    Object.values(containersPorAba).forEach(el => el && el.classList.remove("active"));
    const alvo = containersPorAba[btn.dataset.tab];
    alvo && alvo.classList.add("active");

    if (btn.dataset.tab === "favoritas") {
      atualizarListaFavoritas();
    } else if (btn.dataset.tab === "playlists") {
      atualizarListaPlaylists();
    } else {
      atualizarListaFavoritos();
    }
  });
});

// =============================
// Controle de volume
// =============================
const volumeSlider = document.getElementById("volume-bar");
const iconeVolume  = document.getElementById("icone-volume");

if (volumeSlider && audio) {
  audio.volume = 1.0;
  volumeSlider.value = 100;

  volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value / 100;
    if (iconeVolume)
      iconeVolume.src = audio.volume === 0 ? "imagens/mute.png" : "imagens/volume-up.png";
  });

  iconeVolume?.addEventListener("click", () => {
    if (audio.volume > 0) {
      audio.volume = 0;
      volumeSlider.value = 0;
      iconeVolume && (iconeVolume.src = "imagens/mute.png");
    } else {
      audio.volume = 1;
      volumeSlider.value = 100;
      iconeVolume && (iconeVolume.src = "imagens/volume-up.png");
    }
  });
}

// =============================
// Playlists
// =============================
const playlistsListaEl = document.getElementById("playlists-lista");
const addPlaylistBtn   = document.getElementById("add-playlist-btn");

// Playlists persistentes do usuário
const playlists = [
  { nome: "Pop Hits", musicas: ["Soda Pop", "Jump"] }
];

// "Favoritas (auto)" é virtual (montada a partir do Set favoritos)
function playlistFavoritasAuto() {
  return { nome: "Favoritas (auto)", musicas: Array.from(favoritos) };
}

function atualizarListaPlaylists() {
  if (!playlistsListaEl) return;
  playlistsListaEl.innerHTML = "";

  // Renderiza playlists do usuário
  playlists.forEach((playlist, idx) => {
    const li = document.createElement("li");
    li.textContent = playlist.nome;
    li.dataset.playlistIndex = String(idx);
    li.className = "playlist-item";
    playlistsListaEl.appendChild(li);
  });

  // Renderiza a playlist automática de favoritas (no final)
  const favAuto = document.createElement("li");
  favAuto.textContent = "Favoritas (auto)";
  favAuto.dataset.playlistIndex = "-1"; // especial
  favAuto.className = "playlist-item";
  playlistsListaEl.appendChild(favAuto);
}

addPlaylistBtn?.addEventListener("click", () => {
  const nome = prompt("Digite o nome da nova playlist:");
  if (!nome) return;
  playlists.push({ nome: nome.trim(), musicas: [] });
  atualizarListaPlaylists();
});

// Abrir modal da playlist
playlistsListaEl?.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const idx = parseInt(li.dataset.playlistIndex, 10);
  const isFavAuto = idx === -1;
  const playlist = isFavAuto ? playlistFavoritasAuto() : playlists[idx];
  if (!playlist) return;
  abrirModalPlaylist(playlist, { index: idx, isFavAuto });
});

function abrirModalPlaylist(playlist, { index, isFavAuto }) {
  // Cria o modal
  let modal = document.createElement("div");
  Object.assign(modal.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    background: "none",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "9999"
  });

  let box = document.createElement("div");
  Object.assign(box.style, {
    background: "#222",
    padding: "24px",
    borderRadius: "12px",
    color: "#fff",
    minWidth: "280px",
    maxWidth: "90vw",
    textAlign: "center",
  });

  // Título
  let header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.gap = "8px";

  let titulo = document.createElement("h3");
  titulo.textContent = playlist.nome;
  titulo.style.margin = "0";

  let acoes = document.createElement("div");

  // Botão Renomear (desabilitado para Favoritas auto)
  let btnRenomear = document.createElement("button");
  btnRenomear.textContent = "Renomear";
  estilizarBtn(btnRenomear, "#ff70a6");
  btnRenomear.disabled = isFavAuto;
  btnRenomear.style.opacity = isFavAuto ? "0.5" : "1";
  btnRenomear.addEventListener("click", () => {
    const novo = prompt("Novo nome da playlist:", playlist.nome);
    if (!novo) return;
    if (!isFavAuto) {
      playlists[index].nome = novo.trim() || playlists[index].nome;
      atualizarListaPlaylists();
      titulo.textContent = playlists[index].nome;
    }
  });

  acoes.appendChild(btnRenomear);
  header.appendChild(titulo);
  header.appendChild(acoes);
  box.appendChild(header);

  // Lista de músicas
  const listaMus = document.createElement("ul");
  Object.assign(listaMus.style, {
    maxHeight: "260px",
    overflowY: "auto",
    padding: "0",
    margin: "16px 0",
    background: "transparent",
    textAlign: "left"
  });

  function renderUl() {
    listaMus.innerHTML = "";
    const nomes = isFavAuto ? Array.from(favoritos) : playlist.musicas;
    nomes.forEach(nome => {
      let liMusica = document.createElement("li");
      liMusica.textContent = nome;
      Object.assign(liMusica.style, {
        cursor: "pointer",
        margin: "10px 0",
        listStyle: "none",
        borderBottom: "1px solid #444",
        padding: "6px 8px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      });

      // Remover (desabilitado para Favoritas auto)
      let btnRemover = document.createElement("img");
      btnRemover.src = "imagens/remover.png";
      btnRemover.alt = "Remover";
      btnRemover.width = 18;
      btnRemover.height = 18;
      btnRemover.style.cursor = isFavAuto ? "not-allowed" : "pointer";
      btnRemover.style.opacity = isFavAuto ? "0.4" : "1";
      if (!isFavAuto) {
        btnRemover.addEventListener("click", (ev) => {
          ev.stopPropagation();
          playlists[index].musicas = playlists[index].musicas.filter(m => m !== nome);
          atualizarListaPlaylists();
          renderUl();
        });
      }

      liMusica.addEventListener("click", () => {
        const idxMusica = musicasLista.findIndex(item => tituloDeLi(item) === nome);
        if (idxMusica >= 0) {
          indexAtual = idxMusica;
          trocarMusica();
          document.body.removeChild(modal);
          overlayLista?.classList.add("hidden");
        }
      });

      liMusica.appendChild(btnRemover);
      listaMus.appendChild(liMusica);
    });

    if (!nomes.length) {
      const vazio = document.createElement("div");
      vazio.textContent = "Sem músicas ainda.";
      vazio.style.opacity = "0.7";
      vazio.style.padding = "8px";
      listaMus.appendChild(vazio);
    }
  }
  renderUl();
  box.appendChild(listaMus);

  // Adicionar música (input com sugestões) — desabilitado para Favoritas auto
  let containerAdd = document.createElement("div");
  containerAdd.style.display = "flex";
  containerAdd.style.flexDirection = "column";
  containerAdd.style.alignItems = "center";
  containerAdd.style.gap = "8px";

  let inputAdd = document.createElement("input");
  inputAdd.type = "text";
  inputAdd.placeholder = "Nome da música";
  Object.assign(inputAdd.style, {
    padding: "8px",
    borderRadius: "6px",
    border: "none",
    width: "80%",
    outline: "none"
  });
  inputAdd.disabled = isFavAuto;
  inputAdd.style.opacity = isFavAuto ? "0.5" : "1";

  // Caixa de sugestões para o inputAdd
  const sugestoesAdd = document.createElement("div");
  prepararSugestoesBox(sugestoesAdd);
  containerAdd.style.position = "relative";
  sugestoesAdd.style.position = "absolute";
  sugestoesAdd.style.top = "64px";
  sugestoesAdd.style.width = "80%";

  if (!isFavAuto) {
    anexarSugestoes(inputAdd, sugestoesAdd, (texto) => {
      inputAdd.value = texto;
      sugestoesAdd.innerHTML = "";
    });
  }

  let btnSalvarMusica = document.createElement("button");
  btnSalvarMusica.textContent = "Adicionar";
  estilizarBtn(btnSalvarMusica, "#70c1ff");
  btnSalvarMusica.disabled = isFavAuto;
  btnSalvarMusica.style.opacity = isFavAuto ? "0.5" : "1";

  btnSalvarMusica.addEventListener("click", () => {
    const nome = (inputAdd.value || "").trim();
    if (!nome) return;
    if (isFavAuto) return;
    if (!playlists[index].musicas.includes(nome)) {
      playlists[index].musicas.push(nome);
      atualizarListaPlaylists();
      renderUl();
      inputAdd.value = "";
      sugestoesAdd.innerHTML = "";
    }
  });

  if (!isFavAuto) {
    containerAdd.appendChild(inputAdd);
    containerAdd.appendChild(sugestoesAdd);
    containerAdd.appendChild(btnSalvarMusica);
    box.appendChild(containerAdd);
  }

  // Botão Fechar
  let fechar = document.createElement("button");
  fechar.textContent = "Fechar";
  estilizarBtn(fechar, "#ff70a6");
  fechar.style.marginTop = "16px";
  fechar.addEventListener("click", () => {
    document.body.removeChild(modal);
  });
  box.appendChild(fechar);

  modal.appendChild(box);
  document.body.appendChild(modal);
}

function estilizarBtn(btn, bg) {
  Object.assign(btn.style, {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    background: bg,
    color: "#fff",
    cursor: "pointer"
  });
}

// =============================
// Busca com sugestões (barra principal)
// =============================
const barraPesquisa = document.getElementById("barra-pesquisa");
let sugestoesBox = document.getElementById("sugestoes-musica");

if (barraPesquisa) {
  // cria a caixa se não existir
  if (!sugestoesBox) {
    sugestoesBox = document.createElement("div");
    sugestoesBox.id = "sugestoes-musica";
    prepararSugestoesBox(sugestoesBox);
    if (barraPesquisa.parentNode) {
      barraPesquisa.parentNode.style.position = "relative";
      barraPesquisa.parentNode.appendChild(sugestoesBox);
    }
  }

  anexarSugestoes(barraPesquisa, sugestoesBox, (texto) => {
    barraPesquisa.value = texto;
    // tocar a música ao selecionar
    const li = musicasLista.find(li => tituloDeLi(li) === texto);
    if (li) {
      const idx = musicasLista.indexOf(li);
      if (idx >= 0) {
        indexAtual = idx;
        trocarMusica();
        overlayLista?.classList.add("hidden");
      }
    }
  });
}

// Helpers de sugestões
function prepararSugestoesBox(box) {
  Object.assign(box.style, {
    position: "absolute",
    left: "0",
    top: "100%",
    width: "100%",
    background: "#222",
    color: "#fff",
    zIndex: "1000",
    borderRadius: "8px",
    boxShadow: "0 2px 8px #0003",
    maxHeight: "180px",
    overflow: "auto",
  });
}

function anexarSugestoes(input, box, onSelect) {
  input.addEventListener("input", () => {
    const termo = (input.value || "").trim().toLowerCase();
    box.innerHTML = "";
    if (!termo) return;

    // ordenar: começa com termo vem primeiro, depois ordem alfabética
    const encontrados = musicasLista
      .filter(li => tituloDeLi(li).toLowerCase().includes(termo))
      .sort((a, b) => {
        const ta = tituloDeLi(a).toLowerCase();
        const tb = tituloDeLi(b).toLowerCase();
        const aComeca = ta.startsWith(termo);
        const bComeca = tb.startsWith(termo);
        if (aComeca && !bComeca) return -1;
        if (!aComeca && bComeca) return 1;
        return ta.localeCompare(tb);
      });

    encontrados.forEach(li => {
      const item = document.createElement("div");
      item.textContent = tituloDeLi(li);
      Object.assign(item.style, {
        cursor: "pointer",
        padding: "6px 12px",
        borderBottom: "1px solid #444",
      });
      item.addEventListener("click", () => {
        onSelect(item.textContent);
        box.innerHTML = "";
      });
      box.appendChild(item);
    });
  });

  input.addEventListener("blur", () => {
    setTimeout(() => { box.innerHTML = ""; }, 200);
  });
}

// =============================
// Inicialização
// =============================
carregarMusica(indexAtual);
atualizarListaPlaylists();

// (IMPORTANTE) NÃO há bloco duplicado com `const addPlaylistBtn` no final.
// =============================
}); // DOMContentLoaded
