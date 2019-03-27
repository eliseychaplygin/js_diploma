'use strict';

class Vector {
    constructor(positionX = 0, positionY = 0) {
        this.x = positionX;
        this.y = positionY;
    }
    plus(vector) {
        if (!(vector instanceof Vector)) {
            throw new Error ('Можно прибавлять к вектору только вектор типа Vector');
        }
        return new Vector(this.x + vector.x, this.y + vector.y);
    }
    times(multiplier) {
        return new Vector(this.x * multiplier, this.y * multiplier);
    }
}

class Actor {
    constructor(position = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
        if (!(position instanceof Vector) || !(size instanceof Vector) || !(speed instanceof Vector)) {
            throw new Error('Один или несколько переданных аргументов не являются объектом класса Vector');
        }
        this.pos = position;
        this.size = size;
        this.speed = speed;
    }
    act() {};
    get left() {
        return this.pos.x;
    }
    get top() {
        return this.pos.y;
    }
    get right() {
        return this.pos.x + this.size.x;
    }
    get bottom() {
        return this.pos.y + this.size.y;
    }
    get type() {
        return 'actor';
    }
    isIntersect(actor) {
        if(!(actor instanceof Actor)) {
            throw new Error('Переданный объект не является объектом класса Actor');
        }
        if (actor === this) {
            return false;
        }
        return actor.left < this.right && actor.top < this.bottom &&
            actor.right > this.left && actor.bottom > this.top;
    } 
}

class Level {
    constructor(grid = [], actor = []) {
        this.grid = grid;
        this.actors = actor;
        this.status = null;
        this.finishDelay = 1;
    }
    get player() {
        return this.actors.find(actor => actor.type === 'player');
    }
    get height() {
        return this.grid.length;
    }
    get width() {
        return this.grid.reduce((memo, el) => {
            if (memo > el.length) {
                return memo;
            }
            return el.length;
        }, 0);
    }
    isFinished() {
        return this.status !== null && this.finishDelay < 0;
    }
    actorAt(actor) {
        if (!(actor instanceof Actor)) {
            throw new Error('Переданный объект не является объектом класса Actor');
        }
        return this.actors.find(el => actor.isIntersect(el));
    }
    obstacleAt(position, size) {
        if (!(position instanceof Vector) && !(size instanceof Vector)) {
            throw new Error('Один или два переданных агрумента не являются объектом класса Vector');
        }
        if ((position.y + size.y) > this.height) {
            return 'lava';
        }
        if (position.x < 0 || position.y < 0 || (position.x + size.x) > this.width) {
            return 'wall';
        }

        const leftBorder = Math.floor(position.x);
        const topBorder = Math.floor(position.y);
        const rightBorder = Math.ceil(position.x + size.x);
        const bottomBorder = Math.ceil(position.y + size.y);

        for (let y = topBorder; y < bottomBorder; y++) {
            for (let x = leftBorder; x < rightBorder; x++) {
                const barrier = this.grid[y][x];
                if (barrier) {
                    return barrier;
                }
            }
        }
    }
    removeActor(actor) {
        const index = this.actors.indexOf(actor);
        if (index !== -1) {
            return this.actors.splice(index, 1);
        }
    }
    noMoreActors(type) {
        return !this.actors.some(actor => actor.type === type);
    }
    playerTouched(type, actor) {
        if (this.status !== null) {
            return;
        }
        if (type === 'lava' || type === 'fireball') {
            this.status = 'lost';
        }
        if (type === 'coin' && actor.type === 'coin') {
            this.removeActor(actor);
            if (this.noMoreActors(type)) {
                this.status = 'won';
            }
        }
    }

}