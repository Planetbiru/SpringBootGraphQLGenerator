let stringUtil = new StringUtil();
let generator = new GraphQLSpringGenerator();
let sqlParser = new SQLParser();
let util = new GraphQLSchemaUtils();
let entityRenderer;
let updatedWidth = 600;
let drawRelationship = true;

/**
 * Autopopulates groupId, artifactId, and serviceName
 * based on the given Java package name.
 *
 * Rules:
 * - groupId = the package name itself
 * - artifactId = the last segment of the package
 * - serviceName = artifactId converted to Title Case
 *
 * @param {string} packageName - The full Java package name (e.g., "com.example.payment")
 * @returns {void}
 */
function autopopulatePackage(packageName) {
    const groupIdInput = document.getElementById("groupId");
    const artifactIdInput = document.getElementById("artifactId");
    const serviceNameInput = document.getElementById("serviceName");
    const pkg = packageName.trim();

    if (!pkg) {
        groupIdInput.value = '';
        artifactIdInput.value = '';
        serviceNameInput.value = '';
        return;
    }

    // Group ID = package name
    groupIdInput.value = pkg;

    // Artifact ID = bagian terakhir dari package
    const parts = pkg.split(".");
    const artifact = parts[parts.length - 1];
    artifactIdInput.value = artifact;

    // Service Name = Title Case dari artifact
    serviceNameInput.value = artifact
        .split(/[-_]/) // pisah kalau ada - atau _
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

/**
 * Applies the given model to the generator and updates the maximum relation depth.
 *
 * - Calculates the maximum relation depth among entities
 * - Subtracts 1 for generator usage
 * - Updates the "maxRelationDepth" input field
 * - Sets the model to the global generator
 *
 * @param {Object} model - The model containing entities
 * @param {Object[]} model.entities - Array of entities
 * @param {number} model.entities[].depth - Depth value for each entity
 * @returns {void}
 */
function applyModel(model) {
    const maxRelationDepthInput = document.getElementById('maxRelationDepth');
    let maxRelationDepth = Math.max(...model.entities.map(obj => obj.depth)) - 1;
    maxRelationDepthInput.value = maxRelationDepth;
    generator.setModel(model);
}

function cloneEntity(entity, tableElement) {
    let cloned = JSON.parse(JSON.stringify(entity));
    if(tableElement)
    {
        let checkboxes = tableElement.querySelectorAll('input.check-column');
        if(checkboxes?.length)
        {
            let selectedColumns = [];
            checkboxes.forEach(checkbox => {
                if(checkbox.checked)
                {
                    selectedColumns.push(checkbox.value);
                }
            });

            if(selectedColumns.length)
            {
                cloned.columns = cloned.columns.filter(col => selectedColumns.includes(col.name));
            }
        }
    }
    return cloned;
}

let resizeTimeout;

window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const wrapper = document.querySelector('.erd-wrapper');
        let tbody = document.querySelector('#entity-selection-body');
        
        if (wrapper) {
            let width = wrapper.clientWidth;
            if(width < 480)
            {
                width = 480;
            }
            entityRenderer.createERD(
                generator.getModel(),
                width, 
                drawRelationship
            );

            entityRenderer.createDescription(generator.getModel(), '#erd-selection');
            createSelector(tbody, generator.getModel());
        }
    }, 30); 
});

function createSelector(tbody, model)
{
    tbody.innerHTML = '';
    if(model?.entities)
    {
        model.entities.forEach(entity => {
            let tr = document.createElement('tr');
            let td2 = document.createElement('td');
            let td3 = document.createElement('td');
            
            let input = document.createElement('input');
            input.setAttribute('type', 'checkbox');
            input.setAttribute('checked', 'checked');
            input.classList.add('selected-entity');
            input.value = entity.name;
            
            td2.innerHTML = entity.name;
            
            let result = '';
            let primaryKeys = entity.columns.filter(column => column.primaryKey);
            if(primaryKeys)
            {
                let names = primaryKeys.map(obj => obj.name);
                result = names.join(', ');
            }

            td3.innerHTML = result;
            tr.appendChild(td2);
            tr.appendChild(td3);
            tbody.appendChild(tr);
        });
    }
}

function updateDbConfig(url) {
    const { driver, dialect } = generator.getDriverAndDialect(url);
    const dbDriverInput = document.getElementById("dbDriver");
    const dbDialectInput = document.getElementById("dbDialect");

    if (driver && dialect) {
        dbDriverInput.value = driver;
        dbDialectInput.value = dialect;
        dbDriverInput.classList.remove("invalid");
        dbDialectInput.classList.remove("invalid");
    } else {
        dbDriverInput.value = "";
        dbDialectInput.value = "";
        dbDriverInput.classList.add("invalid");
        dbDialectInput.classList.add("invalid");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('configForm');
    const packageNameInput = document.getElementById("packageName");
    const dbUrlInput = document.getElementById("dbUrl");
    const sqlFileInput = document.getElementById('sqlFile');
    
    entityRenderer = new EntityRenderer(".erd-svg");
    entityRenderer.initIconEvent(generator);
    const wrapper = document.querySelector('.erd-wrapper');
    if (wrapper) {
        updatedWidth = wrapper.clientWidth;
    }

    packageNameInput.addEventListener('change', function (e) {
        autopopulatePackage(e.target.value);
    });
    packageNameInput.addEventListener('keyup', function (e) {
        autopopulatePackage(e.target.value);
    });

    dbUrlInput.addEventListener('change', function (e) {
        updateDbConfig(e.target.value);
    });
    dbUrlInput.addEventListener('keyup', function (e) {
        updateDbConfig(e.target.value);
    });

    sqlFileInput.addEventListener('change', function (e) {
        const formData = new FormData(form);
        const sqlFile = formData.get('sqlFile');
        if (sqlFile) {
            let tbody = document.querySelector('#entity-primary-key-body');
            generator.status("Import SQL file");
            sqlParser.importSQLFile(sqlFile, (model) => {
                model.entities = model.entities.filter(entity => entity.name !== 'sqlite_sequence');
                applyModel(model);
                if(updatedWidth < 480)
                {
                    updatedWidth = 480;
                }
                entityRenderer.createERD(model, updatedWidth, drawRelationship);
                entityRenderer.createDescription(model, '#erd-selection');
                createSelector(tbody, model);
                generator.status("Finish");
            });
        }
    });


    const formDataInit = new FormData(form);
    const sqlFileInit = formDataInit.get('sqlFile');
    if (sqlFileInit) {
        let tbody = document.querySelector('#entity-primary-key-body');
        generator.status("Import SQL file");
        sqlParser.importSQLFile(sqlFileInit, (model) => {
            model.entities = model.entities.filter(entity => entity.name !== 'sqlite_sequence');
            applyModel(model);
            if(updatedWidth < 480)
            {
                updatedWidth = 480;
            }
            entityRenderer.createERD(model, updatedWidth, drawRelationship);
            entityRenderer.createDescription(model, '#erd-selection');
            createSelector(tbody, model);
            generator.status("Finish");
        });
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        let startTime = new Date();
        generator.status("Get information given in the form");
        const formData = new FormData(form);
        const config = {
            packageName: formData.get('packageName'),
            groupId: formData.get('groupId'),
            artifactId: formData.get('artifactId'),
            serviceName: formData.get('serviceName'),
            serviceDescription: formData.get('serviceDescription'),
            javaVersion: formData.get('javaVersion'),
            version: formData.get('version'),
            maxRelationDepth: parseInt(formData.get('maxRelationDepth')) || 3,
            startTime: startTime
        };
        let selectedModel = {entities: []};
        const checkboxesBody = document.querySelectorAll('input[type="checkbox"].entity-selector');
        if(checkboxesBody.length)
        {
            let selected = [];
            checkboxesBody.forEach(input => {
                if(input.checked)
                {
                    selected.push(input.value);
                }
            });
            
            let model = generator.getModel();
            generator.status("Apply selected entities");
            if(model?.entities)
            {
                model.entities.forEach(entity => {
                    if(selected.includes(entity.name))
                    {
                        let newEntity = cloneEntity(entity, document.querySelector(`table[data-entity="${entity.name}"]`));
                        selectedModel.entities.push(newEntity); 
                    }
                });
            }
        }

        generator.createZipFile(selectedModel, config, document.querySelector('#artifactId').value + ".zip");
    });

    const formToSave = document.getElementById("configForm");
    const storageKey = "formConfigData";

    // Restore data on page load
    function restoreForm() {
        const saved = localStorage.getItem(storageKey);
        if (!saved) return;

        const data = JSON.parse(saved);
        Object.keys(data).forEach(name => {
            const el = formToSave.querySelector(`[name="${name}"]`);
            if (el) {
                el.value = data[name];
            }
        });
    }

    // Save data whenever a field changes
    function backupForm() {
        const data = {};
        const elements = form.querySelectorAll("input[type=text], input[type=number], select");
        elements.forEach(el => {
            data[el.name] = el.value;
        });
        localStorage.setItem(storageKey, JSON.stringify(data));
    }

    // Attach listeners
    formToSave.addEventListener("input", backupForm);
    formToSave.addEventListener("change", backupForm);

    // Restore on load
    restoreForm();

});

function checkAllColumns(source) {
    const checkboxes = source.closest('table').querySelectorAll('.check-column');
    if(checkboxes?.length)
    {
        checkboxes.forEach(checkbox => {
            checkbox.checked = source.checked;
        });
    }
}