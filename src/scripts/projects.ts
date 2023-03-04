import anime from "animejs/lib/anime.es.js";

export default class App {

    toggled: boolean;
    columns: number;
    rows: number;
    tiles: HTMLElement | null;
    
    constructor() {
    
        this.columns = 0
        this.rows = 0
        this.toggled = false;
        this.tiles = null;
    
    }
    
    
    init() {
    
        this.tiles = document.getElementById("tiles");
        this.generateGrid();
        window.addEventListener('resize', this.generateGrid);
    }


    

    

    toggleHandler = (): void => {
        this.toggled = !this.toggled;
        document.body.classList.toggle("toggled", true);
    }

    clickHandler = (index: number) => {
        this.toggleHandler();
    
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
        
        // create a new div element
        const tile: HTMLDivElement = document.createElement("div");

        // add the class "tile" to it
        tile.classList.add("tile");
        
        // set the opacity to 0 if it's toggled, or 1 if it isn't
        tile.style.opacity = String(this.toggled ? 0 : 1);
        
        // set the onclick method to the clickHandler, passing the index
        tile.onclick = e => this.clickHandler(index);
        
        return tile;
    }

    generateTiles = (quantity: number) => {
    Array.from(Array(quantity)).map((tile, index) => {
        this.tiles!.appendChild(this.createTile(index));
        });
    }

    generateGrid = () => {
        // Set the grid to the size of the window
        this.tiles!.innerHTML = "";
        const size = document.body.clientWidth > 800 ? 100 : 50;
        this.columns = Math.floor(document.body.clientWidth / size);
        this.rows = Math.floor(document.body.clientHeight / size);
        
        // Set the CSS grid properties
        this.tiles!.style.setProperty("--columns", String(this.columns));
        this.tiles!.style.setProperty("--rows", String(this.rows));
        
        // Generate the tiles
        this.generateTiles(this.columns * this.rows);
    }


}
