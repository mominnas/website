import anime from "animejs/lib/anime.es.js";


export default class App {

    toggled: boolean;
    columns: number;
    rows: number;
    wrapper: HTMLElement | null;
    
    constructor() {
    
        this.columns = 0
        this.rows = 0
        this.toggled = false;
        this.wrapper = null;
    
    }
    
    
    init() {
    
        this.wrapper = document.getElementById("tiles");
        this.createGrid();
        window.addEventListener('resize', this.createGrid);
    
    }


    

    

    toggle = () => {
        this.toggled = !this.toggled;
        document.body.classList.toggle("toggled");
    }

    handleOnClick = (index: number) => {
        this.toggle();
    
        anime({
            targets: ".tile",
            opacity: this.toggled ? 0 : 1,
            delay: anime.stagger(50, {
            grid: [this.columns, this.rows],
            from: index
            })
        });
    }

    createTile = (index: number) => {
        
        const tile = document.createElement("div");
    
        tile.classList.add("tile");
        
        tile.style.opacity = String(this.toggled ? 0 : 1);
        
        tile.onclick = e => this.handleOnClick(index);
        
        return tile;
    }

    createTiles = (quantity: number) => {
    Array.from(Array(quantity)).map((tile, index) => {
        this.wrapper!.appendChild(this.createTile(index));
        });
    }

    createGrid = () => {
        this.wrapper!.innerHTML = "";
        
        const size = document.body.clientWidth > 800 ? 100 : 50;
        
        this.columns = Math.floor(document.body.clientWidth / size);
        this.rows = Math.floor(document.body.clientHeight / size);
        
        this.wrapper!.style.setProperty("--columns", String(this.columns));
        this.wrapper!.style.setProperty("--rows", String(this.rows));
        
        this.createTiles(this.columns * this.rows);
    }


}
