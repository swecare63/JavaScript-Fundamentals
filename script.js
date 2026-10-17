'use strict';

/* Konstanta aturan nilai. Batas lulus 70 mengikuti contoh pada slide 12.
   Rentang 0 sampai 100 adalah validasi yang saya tentukan sendiri. */
const PASSING_GRADE = 70;
const MIN_SCORE = 0;
const MAX_SCORE = 100;

/* DOM selection: semua elemen diambil sekali di awal berdasarkan id. */
const themeToggle = document.getElementById('theme-toggle');
const toggleProfileButton = document.getElementById('toggle-profile');
const profileExtra = document.getElementById('profile-extra');

const greetingForm = document.getElementById('greeting-form');
const nameInput = document.getElementById('name-input');
const greetingMessage = document.getElementById('greeting-message');

const scoreForm = document.getElementById('score-form');
const scoreInputs = [
  document.getElementById('score1'),
  document.getElementById('score2'),
  document.getElementById('score3')
];
const resetButton = document.getElementById('reset-button');
const scoreError = document.getElementById('score-error');
const averageOutput = document.getElementById('average-output');
const resultMessage = document.getElementById('result-message');

/* Mengisi teks pesan dan menandai jenisnya (neutral, success, warning, error).
   Warna pesan diatur oleh CSS lewat atribut data-state. */
function showMessage(element, text, state) {
  element.textContent = text;
  element.dataset.state = state;
}

/* Fitur 1: sapaan berdasarkan nama. */
function tampilkanSapaan(event) {
  event.preventDefault();
  const name = nameInput.value.trim().replace(/\s+/g, ' ');

  if (name === '') {
    nameInput.setAttribute('aria-invalid', 'true');
    showMessage(greetingMessage, 'Nama belum diisi. Silakan ketik nama Anda dulu.', 'error');
    nameInput.focus();
    return;
  }

  nameInput.removeAttribute('aria-invalid');
  showMessage(greetingMessage, 'Halo, ' + name + '! Selamat datang di halaman profil saya.', 'success');
}

/* Fitur 2: menampilkan atau menyembunyikan profil tambahan. */
function toggleProfil() {
  const willShow = profileExtra.hidden;
  profileExtra.hidden = !willShow;
  toggleProfileButton.setAttribute('aria-expanded', String(willShow));
  toggleProfileButton.textContent = willShow ? 'Sembunyikan Profil Tambahan' : 'Tampilkan Profil Tambahan';
}

/* Fitur 3: pengubah tema terang dan gelap. */
function ubahTema() {
  const root = document.documentElement;
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  themeToggle.setAttribute('aria-pressed', String(nextTheme === 'dark'));
  themeToggle.textContent = nextTheme === 'dark' ? 'Mode Terang' : 'Mode Gelap';
}

/* Validasi satu nilai. Hasilnya objek { value, error }.
   Input memakai type text, bukan number, supaya input kosong dan input
   huruf bisa dibedakan dan masing masing mendapat pesan yang tepat. */
function bacaNilai(rawValue, label) {
  const text = rawValue.trim();

  if (text === '') {
    return { value: null, error: label + ' belum diisi.' };
  }
  if (!/^-?\d+([.,]\d+)?$/.test(text)) {
    return { value: null, error: label + ' harus berupa angka.' };
  }

  const value = Number(text.replace(',', '.'));
  if (value < MIN_SCORE || value > MAX_SCORE) {
    return { value: null, error: label + ' harus antara ' + MIN_SCORE + ' sampai ' + MAX_SCORE + '.' };
  }
  return { value: value, error: null };
}

/* Fitur 5: pesan hasil dengan if/else berdasarkan rata rata. */
function buatPesanHasil(average) {
  if (average >= 80) {
    return { text: 'Lulus (Passed). Nilai Anda sangat baik.', state: 'success' };
  } else if (average >= PASSING_GRADE) {
    return { text: 'Lulus (Passed). Nilai Anda sudah mencapai batas ' + PASSING_GRADE + '.', state: 'success' };
  } else {
    return { text: 'Belum lulus (Try again). Rata-rata masih di bawah ' + PASSING_GRADE + '.', state: 'warning' };
  }
}

function formatAngka(number) {
  return number.toFixed(2).replace('.', ',');
}

function tampilkanError(messages) {
  scoreError.replaceChildren();
  messages.forEach(function (message) {
    const item = document.createElement('li');
    item.textContent = message;
    scoreError.appendChild(item);
  });
  scoreError.hidden = messages.length === 0;
}

/* Fitur 4: kalkulator rata rata tiga nilai. */
function hitungRataRata(event) {
  event.preventDefault();

  const values = [];
  const errors = [];
  let firstInvalid = null;

  scoreInputs.forEach(function (input, index) {
    const result = bacaNilai(input.value, 'Nilai ' + (index + 1));
    if (result.error) {
      errors.push(result.error);
      input.setAttribute('aria-invalid', 'true');
      if (firstInvalid === null) { firstInvalid = input; }
    } else {
      values.push(result.value);
      input.removeAttribute('aria-invalid');
    }
  });

  if (errors.length > 0) {
    tampilkanError(errors);
    averageOutput.textContent = 'Belum dihitung';
    showMessage(resultMessage, 'Perbaiki input di atas terlebih dahulu.', 'neutral');
    firstInvalid.focus();
    return;
  }

  tampilkanError([]);
  const total = values[0] + values[1] + values[2];
  /* Dibulatkan ke dua angka lebih dulu agar angka yang tampil dan keputusan lulus selalu sejalan. */
  const average = Number((total / 3).toFixed(2));
  const result = buatPesanHasil(average);

  averageOutput.textContent = formatAngka(average);
  showMessage(resultMessage, result.text, result.state);
}

function resetKalkulator() {
  scoreInputs.forEach(function (input) {
    input.value = '';
    input.removeAttribute('aria-invalid');
  });
  tampilkanError([]);
  averageOutput.textContent = 'Belum dihitung';
  showMessage(resultMessage, 'Isi tiga nilai, lalu hitung.', 'neutral');
  scoreInputs[0].focus();
}

/* Event listener: setiap fitur dihubungkan ke fungsinya di sini. */
greetingForm.addEventListener('submit', tampilkanSapaan);
toggleProfileButton.addEventListener('click', toggleProfil);
themeToggle.addEventListener('click', ubahTema);
scoreForm.addEventListener('submit', hitungRataRata);
resetButton.addEventListener('click', resetKalkulator);
