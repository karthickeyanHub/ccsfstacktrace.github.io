document.getElementById('csvFile').addEventListener('change', handleFileSelect, false);
var visitedNode = [];
var searchVar = "";
var dupicateRecurcive = [];
var copyText = "";
var fileData;
var isNoMethodFound = false;
function handleFileSelect(event) {
	visitedNode = [];
	dupicateRecurcive = [];
	copyText = "";
	fileData;
	fileData = event.target.files[0];
    
}
function createOnClickHandler(parameter) {
	document.getElementById("searchParams").value = parameter;
}
function handleClick(event){
	searchVar = document.getElementById("searchParams").value;
	isNoMethodFound = false;
	const file = fileData;
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const csvText = e.target.result;
            Papa.parse(csvText, {
                header: true,
                dynamicTyping: true,
                complete: function(results) {
                    const data = results.data;
                    const hierarchy = buildHierarchy(data);
                    displayHierarchy(hierarchy);
                    displayHierarchyText(hierarchy);
                }
            });
        };
        reader.readAsText(file);
    }
	
}
function buildHierarchy(data) {
    const hierarchy = {};
    data.forEach(row => {
        const parent = row['Found_In__c'];
        const method = row['Method_Name__c'];
		//const method = row['Found_In__c'];
        //const parent = row['Method_Name__c'];
        if (!hierarchy[parent]) {
            hierarchy[parent] = [];
        }
        hierarchy[parent].push(method);
    });
    return hierarchy;
}

function createHierarchyList(hierarchy, parent, isChild) {
    const methodsList = document.createElement('ul');
    if (hierarchy[parent]) {
        hierarchy[parent].forEach(method => {
			
			if(!visitedNode.includes(method)){
				const methodElement = document.createElement('li');
				visitedNode.push(method);				
				methodElement.textContent = method;
				// methodElement.onclick = createOnClickHandler(method);
				methodElement.addEventListener('click', function() {                
					createOnClickHandler(method)
				});
				const childList = createHierarchyList(hierarchy, method, true);
				if (isChild) {
					methodElement.className = 'child';
				}
				if (childList) {
					methodElement.appendChild(childList);
				}
				methodsList.appendChild(methodElement);
			}
			/*else{
				if(!dupicateRecurcive.includes(method)){
					dupicateRecurcive.push(method);
					methodElement.textContent = 'Repeat of -> '+method;			
					methodsList.appendChild(methodElement);
				}
			}*/
			
			
        });
    }
    return methodsList.children.length ? methodsList : null;
}

function displayHierarchy(hierarchy) {
    const container = document.getElementById('hierarchy');
    container.innerHTML = '';
    Object.keys(hierarchy).forEach(parent => {
        if (!parent.startsWith('m') && parent !== 'undefined' && parent === searchVar) {
			isNoMethodFound = true;
            const parentElement = document.createElement('div');
            parentElement.className = 'parent';
            parentElement.textContent = parent;
            const methodsList = createHierarchyList(hierarchy, parent, false);
            if (methodsList) {
                parentElement.appendChild(methodsList);
            }
            container.appendChild(parentElement);
        }
    });
	if(!isNoMethodFound){
		//alert('No Occurence Found');
	}
}

function buildHierarchyText(hierarchy, parent, level, finalJson) {
    let text = '';
    if (hierarchy[parent]) {
        hierarchy[parent].forEach(method => {
		
           // text += '    '.repeat(level)+'\n    {\n' + method + '\n    }\n';
            //text += buildHierarchyText(hierarchy, method, level + 1);
		finalJson[parent] ={method: buildHierarchyText(hierarchy, method, level + 1,finalJson)};
        });
    }
     return finalJson;
   // return text;
}

function displayHierarchyText(hierarchy) {
    const textarea = document.getElementById('hierarchyText');
    let text = '{\n';
    let finalJson = {};
    Object.keys(hierarchy).forEach(parent => {
        if (!parent.startsWith('m') && parent !== 'undefined' && parent === searchVar) {
           // text += parent + '\n';
           // text += buildHierarchyText(hierarchy, parent, 1, finalJson);
		finalJson= {parent: buildHierarchyText(hierarchy, parent, 1, finalJson)}
        }
    });
    // textarea.value = text+'\n}';
	textarea.value = finalJson;
}
