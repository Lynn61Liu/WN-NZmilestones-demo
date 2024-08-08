
const { dia, util, shapes: defaultShapes ,ui} = joint;


const chevronCount = 40;
const chevronHeight = 8;
const chevronWidth = 3;
const timelineColor = '#fff';
const backgroundColor = '#444';
const padding = 30;
const gap = 70;
const timelineY = 200;
const timelineXMin = 140;
const timelineXMax = 950;

const timelineEventJSONMarkup = util.svg`
    <ellipse @selector="body"/>
    <text @selector="title"/>
    <text @selector="subtitle"/>
    <text @selector="description"/>
`;

class TimelineEvent extends dia.Element {

    defaults() {
        return {
            ...super.defaults,
            type: 'TimelineEvent',
            attrs: {
                root: {
                    magnetSelector: 'body'
                },
                body: {
                    stroke: 'none',
                    cx: 'calc(w/2)',
                    cy: 'calc(h/2)',
                    rx: 'calc(w/2)',
                    ry: 'calc(h/2)',
                },
                title: {
                    text: 'Label Inside',
                    fontSize: 18,
                    fontFamily: 'sans-serif',
                    fill: timelineColor,
                    textVerticalAnchor: 'top',
                    textAnchor: 'end',
                    x: 'calc(w)',
                    y: 'calc(h + 10)'
                },
                subtitle: {
                    text: 'Subtitle',
                    fontSize: 13,
                    fontFamily: 'sans-serif',
                    fontWeight: 'bold',
                    fill: timelineColor,
                    textVerticalAnchor: 'top',
                    textAnchor: 'end',
                    x: 'calc(w)',
                    y: 'calc(h + 40)'
                },
                description: {
                    text: 'Description',
                    fontSize: 10,
                    fontFamily: 'sans-serif',
                    fill: timelineColor,
                    textVerticalAnchor: 'top',
                    textAnchor: 'end',
                    x: 'calc(w)',
                    y: 'calc(h + 70)'
                },

            }
        };
    }

    preinitialize() {
        this.markup = timelineEventJSONMarkup;
    }

    positionLabels() {
        if (this.position().y > timelineY) {
            if (this.attr('title/y') === 'calc(h + 10)') return;
            this.attr({
                title: {
                    y: 'calc(h + 10)',
                    textVerticalAnchor: 'top'
                },
                subtitle: {
                    y: 'calc(h + 40)',
                    textVerticalAnchor: 'top'
                },
                description: {
                    y: 'calc(h + 60)',
                    textVerticalAnchor: 'top'
                }
            });
        } else {
            if (this.attr('title/y') === -10) return;
            this.attr({
                title: {
                    y: -10,
                    textVerticalAnchor: 'bottom'
                },
                subtitle: {
                    y: -40,
                    textVerticalAnchor: 'bottom'
                },
                description: {
                    y: -60,
                    textVerticalAnchor: 'bottom'
                }
            });
        }
    }
}

const shapes = { ...defaultShapes, TimelineEvent };

const graph = new dia.Graph({}, {
    cellNamespace: shapes
});

const paper = new dia.Paper({  
    width: "100%",
    height: "100%",
    model: graph,
    defaultConnectionPoint: {
        name: 'boundary'
    },
    background: {
        color: backgroundColor
       
    },
    cellViewNamespace: shapes,
    interactive: (cellView) => {
        return (cellView.model instanceof TimelineEvent);
    },
    restrictTranslate(elementView) {
        const timelineMargin = 20;
        const bbox = elementView.model.getBBox();
        const xMin = timelineXMin;
        const xMax = timelineXMax - bbox.width;
        const yMin = timelineY - bbox.height - timelineMargin;
        const yMax = timelineY + timelineMargin;
        return function(x, y) {
            return {
                x: Math.max(xMin, Math.min(xMax, x)),
                y: (y > timelineY) ? Math.max(yMax, y) : Math.min(yMin, y)
            };
        };
    },
    gridSize: 10,
    async: true,
    sorting: dia.Paper.sorting.APPROX,
    defaultLink: () => new shapes.standard.DoubleLink(),
    defaultLinkAnchor: { name: 'connectionPerpendicular' }
});

document.getElementById('paper-container').appendChild(paper.el);
// Timeline

const start = new shapes.standard.Ellipse({
    position: {
        x: timelineXMin - 120,
        y: timelineY - 60
    },
    size: {
        width: 120,
        height: 120
       
    },
    attrs: {
        root: {
            pointerEvents: 'none'
        },
        body: {
            stroke: timelineColor,
            fill: backgroundColor,
            strokeWidth: 3
        },
        label: {
            fill: timelineColor,
            fontFamily: 'sans-serif',
            fontSize: 18
        }
    }
});
const end = new shapes.standard.Ellipse({
    position: {
        x: timelineXMax,
        y: timelineY - 30
    },
    size: {
        width: 60,
        height: 60
    },
    attrs: {
        root: {
            pointerEvents: 'none'
        },
        body: {
            stroke: timelineColor,
            fill: backgroundColor,
            strokeWidth: 3
        },
        label: {
            fontSize: 13,
            fill: timelineColor,
            fontFamily: 'sans-serif',
            text: 'present'
        }
    }
});

const timeline = new shapes.standard.Link({
    source: {
        id: start.id
    },
    target: {
         id: end.id
        
    },
    z: -2,
    attrs: {
        root: {
            pointerEvents: 'none'
        },
        line: {
            strokeWidth: chevronHeight,
            stroke: timelineColor,
            targetMarker: null,
            vertexMarker: {
                d: `M -${2 * chevronWidth} -${chevronHeight / 2} h ${chevronWidth} L 0 0 -${chevronWidth} ${chevronHeight / 2} h -${chevronWidth} L -${chevronWidth} 0 z`,
                fill: backgroundColor,
                stroke: 'none'
            }
        }
    },
    vertices: Array.from({ length: chevronCount }).map((_, i) => {
        return {
            x: timelineXMin + padding + i * (timelineXMax - timelineXMin - padding) / chevronCount,
            y: timelineY
        };
    })
});

graph.addCells([start, end, timeline]);

graph.on('change:position', function(cell) {
    if (cell instanceof TimelineEvent) {
        cell.positionLabels();
    }
});

// Milestones example

const colors = [
    '#B3D9FF',
    '#99CCFF',
    '#80BFFF',
    '#66B3FF',
    '#4DA6FF',
    '#3399FF',
    '#1A8CFF',
    '#0080FF',
    '#0073E6',
    '#0066CC',
    '#0059B3',
    '#004D99',
    '#004080',
    '#003366'
];

    
 const colorss = ['#F4F269','#E7ED6A','#DBE76A','#CEE26B','#C1DD6B','#B5D76C','#A8D26D','#9BCD6D','#8FC76E','#82C26E','#75BD6F','#69B76F','#5CB270', '#4DA562'];

start.attr({
    label: {
        fill: shadeHexColor(colors[0], 0.5),
        text: 'New Zealand \nMilestones'
    }
});

addEvent(gap * 0, 50, {
    color: colors[0],
    title: '1250-1300 AD',
    subtitle: 'Polynesian Settlement',
    description: '● The first Polynesians arrived in New Zealand, becoming the ancestors of the Māori people.'
});

addEvent(gap * 1, -100, {
    color: colors[1],
    title: '1642',
    subtitle: 'Arrival of Abel Tasman',
    description: '● Dutch explorer Abel Tasman was the first European to sight New Zealand.'
});

addEvent(gap * 2, 100, {
    color: colors[2],
    title: '1769-1777',
    subtitle: 'Captain James Cooks Exploration',
    description: '● British explorer Captain James Cook mapped the coastline of New Zealand and established contact with the Māori.'
});

addEvent(gap * 3, -50, {
    color: colors[3],
    title: '1840',
    subtitle: 'Treaty of Waitangi',
    description: '● The Treaty of Waitangi was signed between the British Crown and various Māori chiefs, establishing British sovereignty while guaranteeing Māori land rights.'
});

addEvent(gap * 4, 50, {
    color: colors[4],
    title: '1845-1872',
    subtitle: 'New Zealand Wars',
    description: '● A series of conflicts between the British colonial forces and Māori tribes over land and sovereignty.'
});

addEvent(gap * 5, -100, {
    color: colors[5],
    title: '1893',
    subtitle: 'Women\'s Suffrage',
    description: '● New Zealand became the first country in the world to grant women the right to vote.'
});

addEvent(gap * 6, 100, {
    color: colors[6],
    title: '1915',
    subtitle: 'Gallipoli Campaign',
    description: '● New Zealand soldiers participated in the Gallipoli Campaign during World War I, which became a significant event in the nation\'s military history.'
});

addEvent(gap * 7, -50, {
    color: colors[7],
    title: '1975',
    subtitle: 'Waitangi Tribunal',
    description: '● The Waitangi Tribunal was established to address grievances related to breaches of the Treaty of Waitangi.'
});

addEvent(gap * 8, 50, {
    color: colors[8],
    title: '1987',
    subtitle: 'Nuclear-Free Zone',
    description: '● New Zealand declared itself a nuclear-free zone, banning nuclear-powered or nuclear-armed ships from its waters.'
});

addEvent(gap * 9, -100, {
    color: colors[9],
    title: '1987',
    subtitle: 'Māori Language Act',
    description: '● Te Reo Māori was made an official language of New Zealand.'
});

// addEvent(gap * 10, 100, {
//     color: colors[10],
//     title: '2019',
//     subtitle: 'v12.0 and v13.0',
// });

// addEvent(gap * 11, -50, {
//     color: colors[11],
//     title: '2020',
//     subtitle: 'v14.0 and v15.0',
// });

// addEvent(gap * 12, 50, {
//     color: colors[12],
//     title: '2021',
//     subtitle: 'Version 16.0',
// });

// addEvent(gap * 13, -100, {
//     color: colors[13],
//     title: '2022',
//     subtitle: 'Version 18.0',
//     description: '● Active LTS'
// });

// Functions

function shadeHexColor(color, percent) {
    const f = parseInt(color.slice(1), 16);
    const t = percent < 0 ? 0 : 255;
    const p = percent < 0 ? percent * -1 : percent;
    const R = f>>16;
    const G = f>>8&0x00FF;
    const B = f&0x0000FF;
    return '#' + (0x1000000+(Math.round((t-R)*p)+R)*0x10000 + (Math.round((t-G)*p)+G)*0x100 + (Math.round((t-B)*p)+B)).toString(16).slice(1);
}

function addEvent(x, y, options = {}) {
    const { color = '#000', title = '', subtitle = '', description = '' } = options;
    const event = new TimelineEvent({
        position: {
            x: timelineXMin + padding + x,
            y: y > 0 ? timelineY + y : timelineY + y - 40
        },
        size: {
            width: 20,
            height: 20
        },
        attrs: {
            body: {
                 fill: color,
                //fill: 'RED',
            },
            title: {
                fill: color,
                text: title
            },
            subtitle: {
                text: subtitle,
                fill: shadeHexColor(color, 0.5),
                textWrap: { width: 180, height: null}
            },
            description: {
                text: description,
                textWrap: { width: 120, height: null }
            }
            
        },

    });



    
    const eventLine = new shapes.standard.Link({
        source: { id:  event.id },
        target: { id: timeline.id },
        z: -1,
        attrs: {
            root: {
                pointerEvents: 'auto'
            },
            line: {
                strokeWidth: 1,
                stroke: timelineColor,
                strokeDasharray: '2,2',
                targetMarker: {
                    markup: util.svg`
                        <circle r="14" stroke="${timelineColor}" stroke-width="1" fill="${backgroundColor}" />
                        <circle r="8" fill="${color}" stroke="none" />
                    `
                }
            }
        }
    });
    event.positionLabels();
    graph.addCells([event, eventLine]);
    
}



function scaleToFit() {
  paper.scaleContentToFit({
    useModelGeometry: true,
    padding: { horizontal: 20, vertical: 40 }
  });
  const sy = paper.scale().sy;
  paper.translate(0, (paper.getArea().height / 2 - timelineY) * sy);
};

window.addEventListener('resize', () => scaleToFit());
scaleToFit();

// Modal detail story
const firstdetailStoryHTML = `
<div id="detailStory">
    <div class="sectionwrap">
      <div class="detailTitle">Discovery and migration</div>
      <div class="detailDesc">
        <p>
          New Zealand has a shorter human history than almost any other country. The date of first settlement is a
          matter of debate, but current understanding is that the first arrivals came from East Polynesia between
          1250 and 1300 CE. It was not until 1642 that Europeans became aware the country existed.
        </p>
        <p>The original Polynesian settlers discovered the country on deliberate voyages of exploration, navigating
          by making use of prevailing winds and ocean currents, and observing the stars. The navigator credited in
          some traditions with discovering New Zealand is Kupe. Some time later the first small groups arrived from
          Polynesia. Now known as Māori, these tribes did not identify themselves by a collective name until the
          arrival of Europeans when, to mark their distinctiveness the name Māori, meaning ‘ordinary’, came into
          use.
        </p>
      </div>
      <img class="detailImg" src="https://teara.govt.nz/files/1449-enz.jpg" alt="">
    </div>
    <div class="sectionwrap">
      <div class="detailTitle">Hunting and gathering</div>
      <div class="detailDesc">
        <p>
          The early settlers lived in small hunting bands. Seals and the large, flightless moa bird were their main
          prey, until moa were hunted to extinction. In the South Island, hunting and gathering remained the main
          mode of survival.
        </p>
      </div>
    </div>
    <div class="sectionwrap">
      <div class="detailTitle">Gardening and fishing</div>
      <div class="detailDesc">
        <p>
          The Polynesians brought with them kūmara (sweet potatoes) and yams, which grew well in the warmer North
          Island. Extensive kūmara gardens supported relatively large settlements. But even in the north, birds,
          fish and shellfish were important in the Māori diet. In some northern areas, large populations put
          pressure on resources. The Polynesian dog and rat came with the early arrivals, but the domestic pigs and
          chickens of the islands did not, for reasons not fully understood.
        </p>
      </div>
    </div>
    <div class="sectionwrap">
      <div class="detailTitle">Warfare</div>
      <div class="detailDesc">
        <p>The concepts of mana (status) and utu (reciprocity) were central to the culture, and led to widespread
          warfare. But the violence was usually episodic. For most of the time Māori lived not in fortified pā but
          in unprotected settlements or seasonal camps.
        </p>
      </div>
    </div>
    <div class="sectionwrap">
      <div class="detailTitle">Material culture</div>
      <div class="detailDesc">
        <p>The greatest achievements of Māori material culture were carving wood for important buildings and canoes,
          and fashioning stone and bone into tools and ornaments. Warfare did not inhibit regular trade in desirable
          stones and foods, and was itself a means by which resources were appropriated.
        </p>
      </div>
      <button class="close-btn"><i class="fas fa-times"></i></button>
    </div>
</div>
`;


const seconddetailStoryHTML =`
<div class="sectionwrap">
<div class="detailTitle"> Abel Tasman 1603 - 1659 was a Dutch explorer.</div>
<div class="detailDesc">
  <div class="video-container">
    <iframe src="https://www.youtube.com/embed/ljbUeZuq1CI?si=5NKprmUc_tk2l-Iv" title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
  </div>

</div>

</div>
`;

document.addEventListener('DOMContentLoaded', function() {
    const firstDot = document.getElementById('j_5');
    const secondDot = document.getElementById('j_7');
     const modal = document.querySelector(".modal-overlay");
     const closeBtn = document.querySelector(".close-btn");
     let detailStory= document.getElementById("detailStory");
    secondDot.addEventListener('click', function() { 
         modal.classList.add("open-modal");
         detailStory.innerHTML = seconddetailStoryHTML;
         
        
        
    })
    firstDot.addEventListener('click', function() { 
         modal.classList.add("open-modal");
         detailStory.innerHTML = firstdetailStoryHTML;
        
    })
    closeBtn.addEventListener("click", function () {
        // alert("click close button");
        modal.classList.remove("open-modal");
      });

})





