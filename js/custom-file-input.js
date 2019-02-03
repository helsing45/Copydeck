(function (window) {
	

	function makeDroppable(element, callback) {
		var input = document.createElement('input');
		input.webkitdirectory = true;
		input.mozdirectory = true;
		input.msdirectory = true;
		input.odirectory = true;
		input.directory = true;
		input.setAttribute('type', 'file');
		input.setAttribute('multiple', true);
		input.style.display = 'none';

		input.addEventListener('change', function(e) { triggerCallback(e, callback)});
		element.appendChild(input);

		element.addEventListener('dragover', function (e) {
			e.preventDefault();
			e.stopPropagation();
			element.classList.add('dragover');
		});

		element.addEventListener('dragleave', function (e) {
			e.preventDefault();
			e.stopPropagation();
			element.classList.remove('dragover');
		});

		element.addEventListener('drop', function (e) {
			e.preventDefault();
			e.stopPropagation();
			element.classList.remove('dragover');
			triggerCallback(e, callback);
		});

		element.addEventListener('click', function (e) {
			input.value = null;
			input.click();
		});

	}

	function triggerCallback(e, callback) {
		if (!callback || typeof callback !== 'function') {
			return;
		}
		var files;
		if (e.dataTransfer) {
			files = e.dataTransfer.files;
		} else if (e.target) {
			files = e.target.files;
		}
		callback.call(null, files);
	}

	function onResourceReceived(files){
		inputFiles = files;
		displayInput(files);
	}
	
	window.makeDroppable = makeDroppable;

	makeDroppable(window.document.querySelector('.drop-zone-input'),
	function(files){
		var loads = [];

		for (var i = 0; i < files.length; i++) {
			var file = files[i],
				reader = new FileReader();

			reader.onload = (function (file) {
				return function (e) {
					var data = this.result;
					var splitted = file.name.split('.');
					loads.push({
						path: file.webkitRelativePath,
						name: file.name,
						extension:splitted[splitted.length-1],
						data: data
					});
					if (loads.length == files.length) {
						onResourceReceived(loads)
					}
				}
			})(file);
			reader.readAsText(file, 'UTF-8');
		}
	});


})(this);