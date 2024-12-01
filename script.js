document.getElementById('csvFile').addEventListener('change', handleFileSelect, false);
var visitedNode = [];
var visitedNodeForJSON = [];
var searchVar = "";
var dupicateRecurcive = [];
var copyText = "";
var fileData;
var isNoMethodFound = false;
var isUpStream = false;
const toggle = document.getElementById('toggle');
  const toggleLabel = document.getElementById('toggleLabel');

  toggle.addEventListener('click', function() {
    toggle.classList.toggle('on');

    // Update label based on the toggle status
    if (toggle.classList.contains('on')) {
	  isUpStream = true;
      toggleLabel.textContent = 'Up Stream';
    } else {
	  isUpStream = false;
      toggleLabel.textContent = 'Down Stream';
    }
  });

function handleFileSelect(event) {
	visitedNode = [];
	visitedNodeForJSON =[];
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
		let parent;
		let method;
		if(!isUpStream){
			parent = row['Found_In__c'];
			method = row['Method_Name__c'];
		}else{
			method = row['Found_In__c'];
			parent = row['Method_Name__c'];
		}
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

function buildHierarchyText(hierarchy, parent, level) {
    let text = '';
    const finalJson = {};
    if (hierarchy[parent]) {
        hierarchy[parent].forEach(method => {
	    if(!visitedNodeForJSON.includes(method)){
		    visitedNodeForJSON.push(method);
           // text += '    '.repeat(level)+'\n    {\n' + method + '\n    }\n';
            //text += buildHierarchyText(hierarchy, method, level + 1);
		finalJson[method] = buildHierarchyText(hierarchy, method, level + 1);
	    }
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
		finalJson= buildHierarchyText(hierarchy, parent, 1);
        }
    });
    // textarea.value = text+'\n}';
	textarea.value = JSON.stringify(finalJson);
}
