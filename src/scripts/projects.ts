import anime from "animejs/lib/anime.es.js";

export default class App {

    toggled: boolean;
    columns: number;
    rows: number;
    gridCells: Array<HTMLElement> | null;
    
    constructor() {
    
        this.columns = 0
        this.rows = 0
        this.toggled = false;
        this.gridCells = null;
    
    }
    
    
    init() {
        this.gridCells = new Array();
        for (let i = 1; i < 3; i++) {
            this.gridCells.push(document.getElementById("cells-" + i)!);
        }
        this.generateGrid();
        window.addEventListener('resize', this.generateGrid);
    
    }

    

    toggleHandler = (): void => {

        this.toggled = !this.toggled;
        // document.body.classList.toggle("toggled");
        document.getElementById("gridcard-1")!.classList.toggle("toggled");

        document.getElementById("gridcard-2")!.classList.toggle("toggled");
    
    }

    clickHandler = (index: number) => {
        
        this.toggleHandler();
    
        anime({
            targets: ".cell-1",
            opacity: this.toggled ? 0 : 1,
            delay: anime.stagger(50, {
            grid: [this.columns, this.rows],
            from: index
            })
        });


        anime({
            targets: ".cell-2",
            opacity: this.toggled ? 0 : 1,
            delay: anime.stagger(50, {
            grid: [this.columns, this.rows],
            from: index
            })
        });

    
    }

    createCell = (index: number) => {
        
        // create a new div element
        const cell: HTMLDivElement = document.createElement("div");

        // add the class "cell" to it
        cell.classList.add("cell-1");
        
        cell.classList.add("cell-2");


        // set the opacity to 0 if it's toggled, or 1 if it isn't
        cell.style.opacity = String(this.toggled ? 0 : 1);
        
        // set the onclick method to the clickHandler, passing the index
        cell.onclick = e => this.clickHandler(index);
        
        return cell;
    }

    
    generateCells = (quantity: number) => {
    
        Array.from(Array(quantity)).map((tile, index) => {
            this.gridCells?.forEach((grid) => {
                grid!.appendChild(this.createCell(index));
            });
        });
    
    }

    generateGrid = () => {
        // Set the grid to the size of the window
        this.gridCells!.forEach(grid => {
            grid!.innerHTML = "";
        });
        // this.gridCells!.innerHTML = "";
        const size = document.body.clientWidth > 800 ? 100 : 50;
        this.columns = Math.floor(document.body.clientWidth / size);
        this.rows = Math.floor(document.body.clientHeight / size);
        
        // Set the CSS grid properties

        this.gridCells!.forEach(grid => {
            grid!.style.setProperty("--columns", String(this.columns));
            grid!.style.setProperty("--rows", String(this.rows));
        });
        // Generate the tiles
        this.generateCells(this.columns * this.rows);
    }


}
