//getting pitch_id from the url
const url = new URL(window.location.href);			
const params = new URLSearchParams(url.search);			
const pitch_id = params.get("pitch_id");		
console.log(`pitch_id: ${pitch_id}`);	


// const strapi_url = 'https://determined-prize-6f40828479.strapiapp.com';
// const authToken = '95efe3f015d4ad61574f417a83b119db18609633255bf6a5a477c9cd4c6b8a6576e7d47e06791f264e17fa6c549d0e9228dd5736c010ae06af836eff9a2cdbf1c05d23eb4bd4ca4586bf32183aae0e900028b34acbad71b54dd7c61f2312c1233d446b3c50f63d2aef588dadb561da41f8d9b8ddaee5b191c12d06c3bed03a73';

let slidesData = [];  

// Build slides only after Reveal is ready so controls are rendered
Reveal.on('ready', () => { createSlidesData(); });

const proxy_base_url = 'http://localhost:4000'

// createSlidesData();

function createSlidesData(){
    fetch(`${proxy_base_url}/api/slides?pitch_id=${pitch_id}`)
    .then(response => response.json())
    .then(async data => {
        const slides = data.data;

        async function getSlides(slides) {
            const built = await Promise.all(slides.map(async (slide) => {
                if (slide.posts.length > 0) {
                    const images = await Promise.all(slide.posts.map(async (post) => {
                        // if(post.image != null){
                        //     const res = await fetch(`${proxy_base_url}/api/files/${post.image}`);
                        //     const imgData = await res.json();
                        //     return {
                        //         src: imgData.formats.large.url,
                        //         alt: imgData.formats.large.name,
                        //         caption: post.caption
                        //     };
                        // }
                        // return {
                        //     src: 'https://imexpert.au/wp-content/uploads/2023/08/image-not-found.png',
                        //     alt: 'image not found',
                        //     caption: ''
                        // }     
                        const res = await fetch(`${proxy_base_url}/api/files/${post.image}`);
                        const imgData = await res.json();
                        return {
                            src: imgData.formats.large.url,
                            alt: imgData.formats.large.name,
                            caption: post.caption
                        };                       
                    }));
                    return {
                        type: "gallery",
                        heading: slide.title,
                        images
                    };
                } else {
                    // if(slide.image != null){
                    //     const res = await fetch(`${proxy_base_url}/api/files/${slide.image}`);
                    //     const imgData = await res.json();
                    //     return {
                    //         type: "two-column",
                    //         heading: slide.title,
                    //         image: {
                    //             src: imgData.formats.large.url,
                    //             alt: imgData.formats.large.name
                    //         },
                    //         text: slide.text[0].children[0].text
                    //     };
                    // }
                    // return {
                    //     type: "two-column",
                    //     heading: slide.title,
                    //     image: {
                    //         src: 'https://imexpert.au/wp-content/uploads/2023/08/image-not-found.png',
                    //         alt: 'image not found'
                    //     },
                    //     text: slide.text[0].children[0].text
                    // };    
                    const res = await fetch(`${proxy_base_url}/api/files/${slide.image}`);
                    const imgData = await res.json();
                    return {
                        type: "two-column",
                        heading: slide.title,
                        image: {
                            src: imgData.formats.large.url,
                            alt: imgData.formats.large.name
                        },
                        text: slide.text[0].children[0].text
                    };                
                }
            }));
            return built;
        }
        const builtSlides = await getSlides(slides);
        
        const groupedSlides = groupSlidesByIdea(builtSlides, slides);

        // Clear global array
        slidesData.splice(0, slidesData.length);

        // Flatten into one sequence (if you want all ideas shown in one deck)
        groupedSlides.forEach(group => {
            slidesData.push(...group.slides);
        });        

        createSlides(slidesData);
        // Force layout and ensure we start at the first slide
        Reveal.sync();
        Reveal.layout();
        Reveal.slide(0, 0, 0);
    })
    .catch(error => {
        console.error("Error fetching ideas:", error);
    });
}

// const slidesData = [
//     {
//         type: "two-column",
//         heading: "Welcome to My Slide",
//         image: {
//             src: "https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU",
//             alt: "Sample Image"
//         },
//         text: "This is some sample text describing the image or providing additional information. You can customize this text to fit your presentation needs."
//     },
//     {
//         type: "gallery",
//         heading: "Gallery of Images",
//         images: [
//             { src: "https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU", alt: "Mountain Lake", caption: "Mountain Lake" },
//             { src: "https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU", alt: "Cute Dog", caption: "Cute Dog" },
//             { src: "https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU", alt: "Forest Path", caption: "Forest Path" }
//         ]
//     }
// ];

// Reveal.on('ready', () => createSlides(slidesData));
// createSlides(slidesData)

function groupSlidesByIdea(builtSlides, rawSlides) {
    // Map idea.documentId -> slides[]
    const grouped = {};

    builtSlides.forEach((slide, i) => {
        const ideaSeqId = rawSlides[i].idea.sequence;
        if (!grouped[ideaSeqId]) grouped[ideaSeqId] = [];
        grouped[ideaSeqId].push(slide);
    });

    // Sort each group so that "two-column" slides come first
    const orderedGroups = Object.entries(grouped).map(([docId, slides]) => {
        slides.sort((a, b) => {
            const order = { "two-column": 1, "gallery": 2 };
            return order[a.type] - order[b.type];
        });
        return { idea: docId, slides };
    });

    console.log(orderedGroups)

    return orderedGroups;
}


function createSlides(slides) {
    const container = document.querySelector(".slides");
    const outer_section = document.createElement("section");

    container.innerHTML = '';

    slides.forEach(slide => {
        const section = document.createElement("section");
        const sectionDiv = document.createElement("div");
        sectionDiv.style.display = "flex";
        sectionDiv.style.flexDirection = "column";
        sectionDiv.style.height = "100%";
        // section.style.display = "flex";
        // section.style.flexDirection = "column";
        // section.style.height = "100%";

        // Heading row
        const headingDiv = document.createElement("div");
        headingDiv.style.flex = "0 0 auto";
        headingDiv.style.marginBottom = "1em";
        headingDiv.innerHTML = `<h2>${slide.heading}</h2>`;
        sectionDiv.appendChild(headingDiv);
        // section.appendChild(headingDiv);

        // Slide content
        const contentDiv = document.createElement("div");
        contentDiv.style.flex = "1 1 auto";
        contentDiv.style.display = "flex";
        contentDiv.style.gap = "2em";
        contentDiv.style.justifyContent = "center";

        if (slide.type === "two-column") {
            // Image column
            const imgDiv = document.createElement("div");
            imgDiv.style.flex = "1 1 0";
            imgDiv.style.display = "flex";
            imgDiv.style.alignItems = "center";
            imgDiv.style.justifyContent = "center";
            imgDiv.innerHTML = `<img src="${slide.image.src}" alt="${slide.image.alt}" style="max-width: 100%; max-height: 300px; border-radius: 8px;">`;

            // Text column
            const textDiv = document.createElement("div");
            textDiv.style.flex = "1 1 0";
            textDiv.style.display = "flex";
            textDiv.style.alignItems = "center";
            textDiv.innerHTML = `<p style="font-size: 1.2em;">${slide.text}</p>`;

            contentDiv.appendChild(imgDiv);
            contentDiv.appendChild(textDiv);

        } else if (slide.type === "gallery") {
            slide.images.forEach(img => {
                const col = document.createElement("div");
                col.style.flex = "1 1 0";
                col.style.display = "flex";
                col.style.flexDirection = "column";
                col.style.alignItems = "center";

                col.innerHTML = `
							<div style="position: relative; width: 100%; display: flex; justify-content: center;">
								<img src="${img.src}" alt="${img.alt}" style="max-width: 100%; max-height: 200px; border-radius: 8px; display: block;">
								<div style="position: absolute; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); color: #fff; font-size: 1em; text-align: center; border-radius: 0 0 8px 8px; padding: 0.3em 0;">
								${img.caption}
								</div>
							</div>
							`;
                contentDiv.appendChild(col);
            });
        }

        sectionDiv.appendChild(contentDiv);
        section.appendChild(sectionDiv);
        // section.appendChild(contentDiv);
        outer_section.appendChild(section);
    });
    container.appendChild(outer_section)
    Reveal.sync();
}