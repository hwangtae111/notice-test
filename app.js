const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const statusMessage = document.querySelector("#statusMessage");
const noticeList = document.querySelector("#noticeList");
const authForm = document.querySelector("#authForm");
const emailInput = document.querySelector("#emailInput");
const passwordInput = document.querySelector("#passwordInput");
const authPage = document.querySelector("#authPage");
const boardPage = document.querySelector("#boardPage");
const userEmail = document.querySelector("#userEmail");
const profileEmail = document.querySelector("#profileEmail");
const nicknameForm = document.querySelector("#nicknameForm");
const nicknameInput = document.querySelector("#nicknameInput");
const saveNicknameButton = document.querySelector("#saveNicknameButton");
const nicknameMessage = document.querySelector("#nicknameMessage");
const signOutButton = document.querySelector("#signOutButton");
const myInfoButton = document.querySelector("#myInfoButton");
const backToBoardButton = document.querySelector("#backToBoardButton");
const authMessage = document.querySelector("#authMessage");
const addNoticeButton = document.querySelector("#addNoticeButton");
const profilePage = document.querySelector("#profilePage");
const myNoticeList = document.querySelector("#myNoticeList");
const myNoticeMessage = document.querySelector("#myNoticeMessage");
const noticeDialog = document.querySelector("#noticeDialog");
const noticeForm = document.querySelector("#noticeForm");
const closeDialogButton = document.querySelector("#closeDialogButton");
const noticeTitleInput = document.querySelector("#noticeTitleInput");
const noticeBodyInput = document.querySelector("#noticeBodyInput");
const isNoticeInput = document.querySelector("#isNoticeInput");
const imageInput = document.querySelector("#imageInput");
const saveNoticeButton = document.querySelector("#saveNoticeButton");
const noticeFormMessage = document.querySelector("#noticeFormMessage");
const listView = document.querySelector("#listView");
const noticeDetailSection = document.querySelector("#noticeDetailSection");
const backToListButton = document.querySelector("#backToListButton");
const detailBadge = document.querySelector("#detailBadge");
const detailTitle = document.querySelector("#detailTitle");
const detailAuthor = document.querySelector("#detailAuthor");
const detailCreatedAt = document.querySelector("#detailCreatedAt");
const detailBody = document.querySelector("#detailBody");
const detailImage = document.querySelector("#detailImage");
const commentList = document.querySelector("#commentList");
const commentForm = document.querySelector("#commentForm");
const commentInput = document.querySelector("#commentInput");
const saveCommentButton = document.querySelector("#saveCommentButton");
const commentMessage = document.querySelector("#commentMessage");

let currentUserId = null;
let myNoticeRequestVersion = 0;
let currentNoticeId = null;
let detailRequestVersion = 0;

function isSupabaseConfigured() {
  return !SUPABASE_URL.includes("YOUR_PROJECT_REF")
    && !SUPABASE_PUBLISHABLE_KEY.includes("YOUR_PUBLISHABLE_KEY");
}

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("is-error", isError);
}

function showAuthMessage(message, isError = false) {
  authMessage.textContent = message;
  authMessage.classList.toggle("is-error", isError);
}

function setAuthButtonsDisabled(isDisabled) {
  authForm.querySelectorAll("button").forEach((button) => {
    button.disabled = isDisabled;
  });
  signOutButton.disabled = isDisabled;
}

function updateAuthView(session) {
  const email = session?.user?.email || "";
  const nextUserId = session?.user?.id || null;
  const userChanged = currentUserId !== nextUserId;
  currentUserId = nextUserId;
  userEmail.textContent = email;
  profileEmail.textContent = email;
  nicknameInput.value = session?.user?.user_metadata?.display_name || "";
  authPage.hidden = Boolean(email);
  boardPage.hidden = !email;

  if (userChanged) {
    myNoticeRequestVersion += 1;
    myNoticeList.replaceChildren();
    myNoticeMessage.textContent = "";
    if (nextUserId) {
      showBoardPage("list");
      loadMyNotices(nextUserId);
      loadNotices();
    }
  }
}

function showBoardPage(pageName) {
  listView.hidden = pageName !== "list";
  profilePage.hidden = pageName !== "profile";
  noticeDetailSection.hidden = pageName !== "detail";
}

function showNicknameMessage(message, isError = false) {
  nicknameMessage.textContent = message;
  nicknameMessage.classList.toggle("is-error", isError);
}

async function loadNickname() {
  const { data, error } = await sb.auth.getUser();
  if (error) {
    console.error(error);
    showNicknameMessage(`닉네임을 불러오지 못했습니다: ${error.message}`, true);
    return;
  }
  nicknameInput.value = data.user?.user_metadata?.display_name || "";
}

async function saveNickname() {
  const displayName = nicknameInput.value.trim();
  if (!displayName) {
    showNicknameMessage("닉네임을 입력해 주세요.", true);
    return;
  }
  saveNicknameButton.disabled = true;
  showNicknameMessage("닉네임을 저장하는 중입니다.");
  const { error } = await sb.rpc("update_display_name", {
    p_display_name: displayName,
  });
  if (error) {
    console.error(error);
    saveNicknameButton.disabled = false;
    showNicknameMessage(`닉네임 저장에 실패했습니다: ${error.message}`, true);
    return;
  }
  const { data: userData, error: userError } = await sb.auth.getUser();
  saveNicknameButton.disabled = false;
  if (userError) {
    console.error(userError);
    showNicknameMessage(`닉네임 저장은 완료되었지만 확인하지 못했습니다: ${userError.message}`, true);
    return;
  }
  nicknameInput.value = userData.user?.user_metadata?.display_name || displayName;
  showNicknameMessage("닉네임이 저장되었습니다.");
  loadNotices();
  loadMyNotices(currentUserId);
  if (currentNoticeId) openNotice(currentNoticeId);
}

function showNoticeFormMessage(message, isError = false) {
  noticeFormMessage.textContent = message;
  noticeFormMessage.classList.toggle("is-error", isError);
}

async function restoreSession() {
  if (!isSupabaseConfigured()) return;

  const { data, error } = await sb.auth.getSession();
  if (error) {
    console.error(error);
    showAuthMessage(`로그인 상태를 확인하지 못했습니다: ${error.message}`, true);
    return;
  }
  updateAuthView(data.session);
}

async function signUp(email, password) {
  setAuthButtonsDisabled(true);
  showAuthMessage("회원가입 중입니다.");
  const { data, error } = await sb.auth.signUp({ email, password });
  setAuthButtonsDisabled(false);
  if (error) {
    console.error(error);
    showAuthMessage(`회원가입에 실패했습니다: ${error.message}`, true);
    return;
  }
  passwordInput.value = "";
  updateAuthView(data.session);
  showAuthMessage(data.session ? "회원가입과 로그인이 완료되었습니다." : "회원가입이 완료되었습니다. 이메일 확인 후 로그인해 주세요.");
}

async function signIn(email, password) {
  setAuthButtonsDisabled(true);
  showAuthMessage("로그인 중입니다.");
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  setAuthButtonsDisabled(false);
  if (error) {
    console.error(error);
    showAuthMessage(`로그인에 실패했습니다: ${error.message}`, true);
    return;
  }
  passwordInput.value = "";
  updateAuthView(data.session);
  showAuthMessage("로그인했습니다.");
}

async function signOut() {
  setAuthButtonsDisabled(true);
  const { error } = await sb.auth.signOut();
  setAuthButtonsDisabled(false);
  if (error) {
    console.error(error);
    showAuthMessage(`로그아웃에 실패했습니다: ${error.message}`, true);
    return;
  }
  updateAuthView(null);
  showAuthMessage("로그아웃했습니다.");
}

function showNotices(notices) {
  noticeList.replaceChildren();
  const table = document.createElement("table");
  const head = document.createElement("thead");
  const body = document.createElement("tbody");
  table.className = "notice-table";
  const headRow = document.createElement("tr");
  ["번호", "구분", "제목", "작성자"].forEach((text) => {
    const cell = document.createElement("th");
    cell.textContent = text;
    headRow.append(cell);
  });
  head.append(headRow);
  notices.forEach((notice) => {
    const row = document.createElement("tr");
    row.dataset.noticeId = notice.id;
    [notice.id, notice.isNotice ? "공지" : "일반", notice.title, notice.author].forEach((text) => {
      const cell = document.createElement("td");
      cell.textContent = text;
      row.append(cell);
    });
    row.addEventListener("click", () => openNotice(notice.id));
    body.append(row);
  });
  table.append(head, body);
  noticeList.append(table);
}

function showCommentMessage(message, isError = false) {
  commentMessage.textContent = message;
  commentMessage.classList.toggle("is-error", isError);
}

// 허용한 태그만 다시 만들어 DB의 HTML을 안전하게 표시합니다.
function createSafeRichFragment(html) {
  const allowedTags = new Set(["B", "STRONG", "I", "EM", "U", "BR", "P", "UL", "OL", "LI"]);
  const source = new DOMParser().parseFromString(html || "", "text/html");
  const fragment = document.createDocumentFragment();

  function copyChildren(sourceNode, targetNode) {
    sourceNode.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        targetNode.append(document.createTextNode(node.textContent));
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (!allowedTags.has(node.tagName)) {
        copyChildren(node, targetNode);
        return;
      }
      const safeElement = document.createElement(node.tagName.toLowerCase());
      copyChildren(node, safeElement);
      targetNode.append(safeElement);
    });
  }

  copyChildren(source.body, fragment);
  return fragment;
}

function getSafeRichHtml(editor) {
  const wrapper = document.createElement("div");
  wrapper.append(createSafeRichFragment(editor.innerHTML));
  return wrapper.innerHTML;
}

function showRichText(container, html) {
  container.replaceChildren(createSafeRichFragment(html));
}

function setupRichToolbars() {
  document.querySelectorAll("[data-editor-toolbar]").forEach((toolbar) => {
    toolbar.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-command]");
      if (!button) return;
      const editor = document.querySelector(`#${toolbar.dataset.editorToolbar}`);
      editor.focus();
      document.execCommand(button.dataset.command, false, null);
    });
  });
}

async function openNotice(noticeId) {
  currentNoticeId = noticeId;
  const requestVersion = ++detailRequestVersion;
  showBoardPage("detail");
  detailTitle.textContent = "게시글을 불러오는 중입니다.";
  detailBody.textContent = "";
  detailImage.removeAttribute("src");
  detailImage.hidden = true;
  commentList.replaceChildren();
  showCommentMessage("");
  const { data: notice, error } = await sb
    .from("notice")
    .select('id, title, body, author, created_at, images, "isNotice"')
    .eq("id", noticeId)
    .single();
  if (requestVersion !== detailRequestVersion || noticeId !== currentNoticeId) return;
  if (error) {
    console.error(error);
    detailTitle.textContent = `게시글을 불러오지 못했습니다: ${error.message}`;
    return;
  }
  detailBadge.textContent = notice.isNotice ? "공지" : "일반";
  detailTitle.textContent = notice.title;
  detailAuthor.textContent = `작성자: ${notice.author}`;
  detailCreatedAt.textContent = new Date(notice.created_at).toLocaleString("ko-KR");
  showRichText(detailBody, notice.body);
  if (notice.images) {
    const { data: imageData } = sb.storage.from(NOTICE_IMAGE_BUCKET).getPublicUrl(notice.images);
    detailImage.src = imageData.publicUrl;
    detailImage.hidden = false;
    detailImage.onerror = () => { detailImage.hidden = true; };
  }
  loadComments(noticeId, requestVersion);
  noticeDetailSection.scrollIntoView({ behavior: "smooth" });
}

async function loadComments(noticeId, requestVersion) {
  const { data: comments, error } = await sb
    .from("comments")
    .select('id, author, "mainText", created_at')
    .eq("noticeId", noticeId)
    .order("created_at", { ascending: true });
  if (requestVersion !== detailRequestVersion || noticeId !== currentNoticeId) return;
  if (error) {
    console.error(error);
    showCommentMessage(`댓글을 불러오지 못했습니다: ${error.message}`, true);
    return;
  }
  commentList.replaceChildren();
  const list = document.createElement("ul");
  list.className = "comment-list";
  comments.forEach((comment) => {
    const item = document.createElement("li");
    const author = document.createElement("strong");
    const text = document.createElement("p");
    author.textContent = comment.author;
    showRichText(text, comment.mainText);
    item.className = "comment-row";
    item.append(author, text);
    list.append(item);
  });
  commentList.append(list);
}

async function saveComment() {
  if (!currentUserId) {
    showCommentMessage("댓글을 등록하려면 먼저 로그인해 주세요.", true);
    return;
  }
  if (!currentNoticeId) return;
  if (!commentInput.textContent.trim()) {
    showCommentMessage("댓글 내용을 입력해 주세요.", true);
    return;
  }
  saveCommentButton.disabled = true;
  showCommentMessage("댓글을 등록하는 중입니다.");
  const noticeId = currentNoticeId;
  const { error } = await sb.rpc("uploadComments", {
    p_notice_id: noticeId,
    p_comments_text: getSafeRichHtml(commentInput),
  });
  saveCommentButton.disabled = false;
  if (error) {
    console.error(error);
    showCommentMessage(`댓글 등록에 실패했습니다: ${error.message}`, true);
    return;
  }
  showCommentMessage("등록이 완료되었습니다.");
  commentInput.replaceChildren();
  loadComments(noticeId, detailRequestVersion);
}

function showMyNotices(notices) {
  myNoticeList.replaceChildren();
  const table = document.createElement("table");
  const head = document.createElement("thead");
  const body = document.createElement("tbody");
  table.className = "notice-table";
  const headRow = document.createElement("tr");
  ["번호", "제목", "상태", "등록일"].forEach((text) => {
    const cell = document.createElement("th");
    cell.textContent = text;
    headRow.append(cell);
  });
  head.append(headRow);
  notices.forEach((notice) => {
    const row = document.createElement("tr");
    row.dataset.noticeId = notice.id;
    [notice.id, notice.title, notice.status, new Date(notice.created_at).toLocaleString("ko-KR")].forEach((text) => {
      const cell = document.createElement("td");
      cell.textContent = text;
      row.append(cell);
    });
    row.addEventListener("click", () => openNotice(notice.id));
    body.append(row);
  });
  table.append(head, body);
  myNoticeList.append(table);
}

async function loadMyNotices(userId) {
  if (!userId || userId !== currentUserId || !isSupabaseConfigured()) return;
  const requestVersion = ++myNoticeRequestVersion;
  myNoticeList.replaceChildren();
  myNoticeMessage.textContent = "내 게시글을 불러오는 중입니다.";
  const { data: notices, error } = await sb
    .from("notice")
    .select('id, title, created_at, status, "isNotice"')
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (requestVersion !== myNoticeRequestVersion || userId !== currentUserId) return;
  if (error) {
    console.error(error);
    myNoticeMessage.textContent = `내 게시글을 불러오지 못했습니다: ${error.message}`;
    myNoticeMessage.classList.add("is-error");
    return;
  }
  myNoticeMessage.classList.remove("is-error");
  if (notices.length === 0) {
    myNoticeMessage.textContent = "작성한 게시글이 없습니다.";
    return;
  }
  showMyNotices(notices);
  myNoticeMessage.textContent = `내 게시글 ${notices.length}건입니다.`;
}

async function uploadImage(file) {
  if (!file) return null;
  const fileExtension = file.name.includes(".") ? file.name.split(".").pop() : "image";
  const filePath = `${currentUserId}/${crypto.randomUUID()}.${fileExtension}`;
  const { error } = await sb.storage.from(NOTICE_IMAGE_BUCKET).upload(filePath, file, { upsert: false });
  if (error) throw error;
  return filePath;
}

async function saveNotice() {
  if (!currentUserId) {
    showNoticeFormMessage("게시글을 등록하려면 먼저 로그인해 주세요.", true);
    return;
  }
  if (!noticeBodyInput.textContent.trim()) {
    showNoticeFormMessage("내용을 입력해 주세요.", true);
    return;
  }
  saveNoticeButton.disabled = true;
  showNoticeFormMessage("게시글을 등록하는 중입니다.");
  try {
    const imagePath = await uploadImage(imageInput.files[0]);
    const { error } = await sb.rpc("uploadNotice", {
      p_notice_title: noticeTitleInput.value.trim(),
      p_notice_body: getSafeRichHtml(noticeBodyInput),
      p_notice_status: "active",
      p_notice_is_notice: isNoticeInput.checked,
      p_notice_image_path: imagePath,
    });
    if (error) throw error;
    showNoticeFormMessage("등록이 완료되었습니다.");
    noticeForm.reset();
    noticeBodyInput.replaceChildren();
    loadNotices();
    loadMyNotices(currentUserId);
    window.setTimeout(() => noticeDialog.close(), 500);
  } catch (error) {
    console.error(error);
    showNoticeFormMessage(`등록에 실패했습니다: ${error.message}`, true);
  } finally {
    saveNoticeButton.disabled = false;
  }
}

async function loadNotices() {
  if (!isSupabaseConfigured()) {
    noticeList.replaceChildren();
    showStatus("config.js에 Supabase URL과 Publishable key를 입력해 주세요.", true);
    return;
  }

  const keyword = searchInput.value.trim();
  noticeList.replaceChildren();
  showStatus("게시글을 불러오는 중입니다.");

  let query = sb
    .from("notice")
    .select('id, title, author, "isNotice"')
    .order("id", { ascending: false });

  // 빈 검색어에는 조건을 더하지 않아 전체 게시글을 조회합니다.
  if (keyword) {
    query = query.like("title", `%${keyword}%`);
  }

  const { data: notices, error } = await query;

  if (error) {
    console.error(error);
    showStatus(`게시글을 불러오지 못했습니다: ${error.message}`, true);
    return;
  }

  if (notices.length === 0) {
    showStatus("검색 결과가 없습니다.");
    return;
  }

  showNotices(notices);
  showStatus(`게시글 ${notices.length}건을 찾았습니다.`);
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadNotices();
});

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!isSupabaseConfigured()) {
    showAuthMessage("config.js에 Supabase URL과 Publishable key를 입력해 주세요.", true);
    return;
  }
  const action = event.submitter?.dataset.authAction;
  if (action === "signup") signUp(emailInput.value.trim(), passwordInput.value);
  if (action === "signin") signIn(emailInput.value.trim(), passwordInput.value);
});

signOutButton.addEventListener("click", signOut);
addNoticeButton.addEventListener("click", () => {
  if (!currentUserId) {
    showAuthMessage("게시글을 등록하려면 먼저 로그인해 주세요.", true);
    return;
  }
  showNoticeFormMessage("");
  noticeDialog.showModal();
});
closeDialogButton.addEventListener("click", () => noticeDialog.close());
noticeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveNotice();
});
backToListButton.addEventListener("click", () => {
  currentNoticeId = null;
  detailRequestVersion += 1;
  showBoardPage("list");
  window.scrollTo({ top: 0, behavior: "smooth" });
});
myInfoButton.addEventListener("click", () => {
  showBoardPage("profile");
  loadMyNotices(currentUserId);
  loadNickname();
});
backToBoardButton.addEventListener("click", () => showBoardPage("list"));
nicknameForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveNickname();
});
commentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveComment();
});

// 인증 변화 시 화면만 갱신합니다. 이 콜백에서 추가 요청을 기다리지 않습니다.
sb.auth.onAuthStateChange((_event, session) => {
  updateAuthView(session);
});

restoreSession();
setupRichToolbars();
loadNotices();
