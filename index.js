const urlInput = document.getElementById('instagramLink');
const getPostButton = document.getElementById('getPost');
const messagesBox = document.getElementById('outputMessages');

const postsContainer = document.getElementById('posts');

const resetContainers = () => {
  postsContainer.innerHTML = '';
  messagesBox.innerHTML = '';
};

const getBlob = async (urlPost, idTag) => {
  const request = new Request(urlPost);
  const response = await fetch(request);
  const myBlob = await response.blob();
  const blobURL = window.URL.createObjectURL(myBlob);

  document.getElementById(idTag).innerHTML = `<a href="${blobURL}" download="${idTag}">Download</a>`;
};

const showPost = async (ownerName, idPost, urlPost, isVideo) => {

  // const linkDownload = await getBlob(urlPost);
  
  let templatePost = `<div class="posts__item">`;

  if (isVideo) templatePost += `<video controls width="100%" height="auto"><source src="${urlPost}" type="video/mp4"></video>`;
  else templatePost += `<image src="${urlPost}" width="100%" height="auto" alt="${ownerName}_${idPost}"></image>`;

  templatePost += `
    <div id="${ownerName}_${idPost}">Loading download button...</div>
    </div>
  `;

  postsContainer.innerHTML += templatePost;

  getBlob(urlPost, `${ownerName}_${idPost}`);
};

const getMultipleImages = (ownerName, posts) => {
  Array.from(posts['edges']).forEach(post => {
    const media = post['node'];
    getPost(ownerName, media);
  });
};

const getPost = (ownerName, media) => {
  const idPost = media['id'];
  let urlPost;
  let isVideo = false;

  if (media['is_video']) {
    urlPost = media['video_url'];
    isVideo = true;
  }
  else {
    const post = media['display_resources'];
    const maxQuality = post.length - 1;
    urlPost = post[maxQuality]['src'];
  }

  showPost(ownerName, idPost, urlPost, isVideo);
};

const getImages = (data) => {
  if (data === null || data['graphql'] === null) messagesBox.innerHTML = 'Something goes wrong with Instagram';

  const media = data['graphql']['shortcode_media'];
  const multiplePost = media['edge_sidecar_to_children'];

  const ownerName = media['owner']['username'];
  if (multiplePost != (undefined || null)) {
    getMultipleImages(ownerName, multiplePost);
  } else {
    getPost(ownerName, media);
  }
};

const fetchData = async (idPost) => {
  const templateURL = `https://www.instagram.com/p/${idPost}/?__a=1`;

  const response = await fetch(templateURL);
  if (response.status == 200) {
    const data = await response.json();
    getImages(data);
  } else {
    messagesBox.innerHTML = 'Not founded or user has a private account';
  }
};

const validateLink = (arrayLink) => {
  messagesBox.innerHTML = '';
  const indexOfP = arrayLink.indexOf('p');
  if (indexOfP > -1) {
    const idPost = arrayLink[indexOfP + 1];
    fetchData(idPost);
  } else {
    messagesBox.innerHTML = 'Not valid link of Instagram post';
  }
};

const listenButton = () => {
  getPostButton.addEventListener('click', (e) => {
    resetContainers();

    const link = urlInput.value;
    let arrayLink = link.split('/');
    validateLink(arrayLink);
  });
};

(() => {
  listenButton();
})();