const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const playlist = $('.playlist')
const player = $('.player')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')        
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const btnNext = $('.btn-next')
const btnPrev = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [

        {
            name: 'Cause i love you',
            singer: 'Noo Phước Thịnh',
            path: '../assets/music/CauseILoveYou.mp3',
            image: '../assets/img/NooPhuocThinh.jpg'
        },
        {
            name: 'Điều anh biết',
            singer: 'Chi Dân',
            path: '../assets/music/DieuAnhBiet.mp3',
            image: '../assets/img/Dieuanhbiet.jpg'
        },
        {
            name: 'Đưa em về nhà',
            singer: 'Grey D, Chillies',
            path: '../assets/music/DuaEmVeNhaa.mp3',
            image: '../assets/img/Duaemvenha.jpg'
        },
        {
            name: 'Gió',
            singer: 'Jank',
            path: '../assets/music/Gio.mp3',
            image: '../assets/img/Gio.jpg'
        },
        {
            name: 'Làm vợ anh nhé',
            singer: 'Chi Dân',
            path: '../assets/music/LamVoAnhNhe.mp3',
            image: '../assets/img/Lamvoanhnhe.jpg'
        },
        {
            name: 'Mãi mãi bên nhau',
            singer: 'Noo Phuoc Thinh',
            path: '../assets/music/MaiMaiBenNhau.mp3',
            image: '../assets/img/MMbennhau.jpg'
        },
        {
            name: 'Ngày đầu tiên',
            singer: 'Đức Phúc',
            path: '../assets/music/NgayDauTien.mp3',
            image: '../assets/img/Ngaydautien.jpg'
        },
        {
            name: 'Như những phút ban đầu',
            singer: 'Hoài Lâm',
            path: '../assets/music/PhutBanDau.mp3',
            image: '../assets/img/Phutbandau.jpg'
        },
        {
            name: 'Ta Còn yêu nhau',
            singer: 'Đức Phúc',
            path: '../assets/music/TaConYeuNhau.mp3',
            image: '../assets/img/Taconyeunhau.jpg'
        },
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    
    render: function() {  
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = ${index}>
                <div class="thumb" style="background-image: url('${song.image}'); background-position: center center; background-size: cover;">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function() {
        Object.defineProperty(this, 'getCurrentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth

        //Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' } 
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        //Xử lí phóng to thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        //Xử lý khi click play
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        //Khi song được play 
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

         //Khi song được play 
         audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        //Khi tiến độ bài hát thay đổi 
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 1000)
                progress.value = progressPercent
            }
        }

        //Xử lý khi tua song 
        progress.onchange = function(e) {
            const seekTime = audio.duration / 1000 *  e.target.value
            audio.currentTime = seekTime
        }

        //Khi next song
        btnNext.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        //Khi prev song
        btnPrev.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        
        //Xử lí random bật / tắt
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        //Xử lí lặp lại song / repeat
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        //Xử lí next song khi audio ended
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play()
            } else {
                btnNext.click()
            }
        }

        //Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if(
                songNode || 
                e.target.closest('.option')
            ) {
                //Xử lí khi click vào song
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }

                //Xử lí khi click vào song option 
                if(e.target.closest('.option')) {

                }
            }
        }
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }, 200)
    },
    loadCurrentSong: function() {
        heading.textContent = this.getCurrentSong.name
        cdThumb.style.backgroundImage = `url('${this.getCurrentSong.image}')`
        audio.src = this.getCurrentSong.path
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function() {
        this.currentIndex++  
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--  
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    start: function() {
        //Gán cấu hình từ config vào ứng dụng
        this.loadConfig()
        
        //Định nghĩa thuộc tính cho Object
        this.defineProperties()

        //Lắng nghe và sử lý các sự kiên DOM Events
        this.handleEvents()

        //Tải thông tin bài hát đầu tiên vào UI
        this.loadCurrentSong()

        //Render playlist
        this.render() 

        //Hiển thị trạng thái ban đầu cảu button repeat và random
        repeatBtn.classList.toggle('active', this.isRepeat)
        randomBtn.classList.toggle('active', this.isRandom)
    }
}

app.start()