Game = {
    Main: function(t) {
        Game.Engine.Target = t;
        Game.Engine.Initalize();

        Game.Instance.Create(new Game.Object[Object.keys(Game.Object)[0]]);
    },
    Instance: {
        List: [],
        ID: 0,
        Create: function(instance, x=0, y=0) {
            instance.id = Game.Instance.ID++;
            instance.bbox = undefined;
            instance.x = x;
            instance.y = y;
            instance.name = instance.constructor.name;
            Game.Instance.List.push(instance);
            if (instance.Create != undefined && instance.Create());
        },
        Destroy: function(instance) {
            for(var i = 0; i < Game.Instance.List.length; i++) {
                if (Game.Instance.List[i].id == instance.id) {
                    Game.Instance.List.splice(i, 1);
                    delete instance;
                    break;
                }
            }
        }
    },
    Engine: {
        /** Internal Methods */
        Target: undefined,
        Initalize: function() {
            Game.Input.Initalize();
            Game.Graphics.Initalize();
            window.setInterval(Game.Engine.Tick, 1000 / 60);
        },
        Tick: function() {
            document.getElementById("debug").innerHTML = `Instance Count: ${Game.Instance.List.length}`;
            Game.Instance.List.forEach(e => {
                if (e.Update != undefined && e.Update());
            });
            Game.Graphics.Tick();
            Game.Input.Tick();
        }
    },
    Collision: {
        Rectangle: function(x, y, x1, y1, x2, y2) {
            if ((x >= x1 && x <= x2) && (y >= y1 && y <= y2)) {
                return true;
            }
            return false;
        },
        CheckGeneric: function(x, y) {
            for(var i = 0; i < Game.Instance.List.length; i++) {
                let Instance = Game.Instance.List[i];
                if (Game.Collision.Rectangle(x, y, Instance.x + Instance.bbox[0], Instance.y + Instance.bbox[1], Instance.x + Instance.bbox[2], Instance.x + Instance.bbox[3]) == true) {
                    return true;
                }
            }
            return false;
        },
        Check: function(instance, x, y) {
            for(var i = 0; i < Game.Instance.List.length; i++) {
                if (Game.Instance.List[i].constructor.name == instance.name) {
                    let Instance = Game.Instance.List[i];
                    if (Game.Collision.Rectangle(x, y, Instance.x + Instance.bbox[0], Instance.y + Instance.bbox[1], Instance.x + Instance.bbox[2], Instance.x + Instance.bbox[3]) == true) {
                        return true;
                    }
                }
            }
            return false;
        }
    },
    Graphics: {
        /** Internal Methods */
        Context: undefined,
        Color: [255, 255, 255],
        Alpha: 1,
        Initalize: function() {
            Game.Graphics.Context = Game.Engine.Target.getContext("2d");
        },
        Tick: function() {
            Game.Graphics.Context.clearRect(0, 0, Game.Engine.Target.width, Game.Engine.Target.height);
            Game.Instance.List.forEach(e => {
                if (e.Render != undefined && e.Render());
                let _Color = Game.Graphics.Color, _Alpha = Game.Graphics.Alpha;
                
                Game.Graphics.SetAlpha(0.25);
                Game.Graphics.SetColor(255, 0, 0);
                Game.Graphics.Line(0, e.y, e.x, e.y);
                Game.Graphics.SetColor(0, 255, 0);
                Game.Graphics.Line(e.x, 0, e.x, e.y);
                Game.Graphics.SetColor(0, 0, 255);
                Game.Graphics.Circle(e.x, e.y, 3, false);
                Game.Graphics.SetAlpha(_Alpha);
                Game.Graphics.SetColor(_Color[0], _Color[1], _Color[2]);
                
            });
        },
        /** External Methods */
        SetStyle: function() {
            Game.Graphics.Context.strokeStyle = `rgba(${Game.Graphics.Color[0]}, ${Game.Graphics.Color[1]}, ${Game.Graphics.Color[2]}, ${Game.Graphics.Alpha})`;
            Game.Graphics.Context.fillStyle = Game.Graphics.Context.strokeStyle;
        },
        SetColor: function() {
            for(var i = 1; i < arguments.length; i++) {
                Game.Graphics.Color[i - 1] = arguments[i];
            }
            Game.Graphics.SetStyle();
        },
        GetColor: function() {
            return Game.Graphics.Color;
        },
        SetAlpha: function(a) {
            Game.Graphics.Alpha = a;
            Game.Graphics.SetStyle();
        },
        GetAlpha: function(a) {
            return Game.Graphics.Alpha;
        },
        Line: function(x1, y1, x2, y2) {
            Game.Graphics.Context.beginPath();
            Game.Graphics.Context.moveTo(x1, y1);
            Game.Graphics.Context.lineTo(x2, y2);
            Game.Graphics.Context.stroke();
        },
        Circle: function(x, y, r, outline) {
            Game.Graphics.Context.beginPath();
            Game.Graphics.Context.arc(x, y, r, 0, Math.PI * 2);
            (outline ? Game.Graphics.Context.stroke() : Game.Graphics.Context.fill());
        },
        Rectangle: function(x1, y1, x2, y2, outline) {
            Game.Graphics.Context.beginPath();
            Game.Graphics.Context.rect(x1, y1, x2 - x1, y2 - y1);
            (outline ? Game.Graphics.Context.stroke() : Game.Graphics.Context.fill());
        }
    },
    Input: {
        /** Internal Methods */
        Initalize: function(t) {
            document.addEventListener("keydown", function(e) {
                if ((e.keyCode in Game.Input.Keys) == false) {
                    Game.Input.Keys[e.keyCode] = 0;
                }
            });

            document.addEventListener("keyup", function(e) {
                Game.Input.Keys[e.keyCode] = 2;
            });

            document.addEventListener("mousedown", function(e) {
                if ((e.button in Game.Input.Keys) == false) {
                    Game.Input.Keys[e.button] = 0;
                }
            });

            document.addEventListener("mouseup", function(e) {
                Game.Input.Keys[e.button] = 2;
            });
        },
        Tick: function() {
            for(let Key in Game.Input.Keys) {
                switch (Game.Input.Keys[Key]) {
                    case 0: {
                        Game.Input.Keys[Key] = 1;
                        break;
                    }

                    case 2: {
                        delete Game.Input.Keys[Key];
                        break;
                    }
                }
            }
        },
        /** Class Methods */
        Keys: {},
        LEFT_CLICK: 0, RIGHT_CLICK: 2, SPACE: 32, LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40,
        Get: function(key) {
            return (key in Game.Input.Keys);
        },
        GetPressed: function(key) {
            return ((key in Game.Input.Keys) && (Game.Input.Keys[key] == 0));
        },
        GetReleased: function(key) {
            return ((key in Game.Input.Keys) && (Game.Input.Keys[key] == 2));
        }
    }
}

Math.lerp = function(a, b, f) {
    return a + f * (b - a);
}