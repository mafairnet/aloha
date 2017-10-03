/**
 * FileUploader
 * Copyright (c) 2017 Innostudio.de
 * Website: http://innostudio.de/fileuploader/
 * Version: 1.3 (16-Sep-2017)
 * Requires: jQuery v1.7.1 or later
 * License: https://innostudio.de/fileuploader/documentation/#license
 */
(function($) {
    "use strict";
	
    $.fn.fileuploader = function(q) {
        return this.each(function(t, r) {
			var s = $(r), // input element
				p = null, // parent element
				o = null, // new input element
				l = null, // list element
				sl = [], // input elements !important for addMore option
				n = $.extend(true, {}, $.fn.fileuploader.defaults, q), // options
				f = {
					/**
					 * init
					 * initialize the plugin
					 *
					 * @void
					 */
					init: function() {
						// create and set the parent element
						if (!s.closest('.fileuploader').length)
							s.wrap('<div class="fileuploader"></div>');
						p = s.closest('.fileuploader');
						
						// add, merge and apply input attributes with the options
						// also define the defaults for some options
						f.set('attrOpts');
						
						// check if the plugin is supported in current browser
						if (!f.isSupported()) {
							n.onSupportError && $.isFunction(n.onSupportError) ? n.onSupportError(p, s) : null;
							return false;
						}
						
						// before render callback
						if (n.beforeRender && $.isFunction(n.beforeRender) && n.beforeRender(p, s) === false) {
							return false;
						}
						
						// redesign the new input
						f.redesign();
						
						// append files from options
                        if (n.files)
						  f.files.append(n.files);
						
						// after render callback
						f.rendered = true;
						n.afterRender && $.isFunction(n.afterRender) ? n.afterRender(l, p, o, s) : null;
						
						// bind events
						if (!f.disabled)
							f.bindUnbindEvents(true);
					},
					
					/**
					 * bindUnbindEvents
					 * bind or unbind events for input and new elements
					 *
					 * @param {bool} bind - bind the events?
					 * @void
					 */
					bindUnbindEvents: function(bind) {
						// unbind events
						if (bind)
							f.bindUnbindEvents(false);
						
						// bind all input events
						s[bind ? 'on' : 'off'](f._assets.getAllEvents(), f.onEvent);
						
						// bind click event for the new input
						if (n.changeInput && o!==s)
							o[bind ? 'on' : 'off']('click', f.clickHandler);
						
						// bind drag&drop events
                        if (n.dragDrop && n.dragDrop.container.length) {
                            n.dragDrop.container[bind ? 'on' : 'off']('drag dragstart dragend dragover dragenter dragleave drop', function(e) { e.preventDefault(); });
                            n.dragDrop.container[bind ? 'on' : 'off']('drop', f.dragDrop.onDrop);
                            n.dragDrop.container[bind ? 'on' : 'off']('dragover', f.dragDrop.onDragEnter);
                            n.dragDrop.container[bind ? 'on' : 'off']('dragleave', f.dragDrop.onDragLeave);
                        }
						
						// bind the paste from clipboard event
                        if (f.isUploadMode() && n.clipboardPaste)
                            $(window)[bind ? 'on' : 'off']('paste', f.clipboard.paste);
						
						// bind sorter events
						if (n.sorter && n.thumbnails && n.thumbnails._selectors.sorter)
							f.sorter[bind ? 'init': 'destroy']();
						
						// bind the form reset
						s.closest('form')[bind ? 'on' : 'off']('reset', f.reset);
					},
					
					/**
					 * redesign
					 * create the new input and hide the standard one
					 *
					 * @void
					 */
					redesign: function() {
						// set as default
						o = s;
						
						// add a class name with theme
						if (n.theme)
							p.addClass('fileuploader-theme-' + n.theme);
						
						// set new input html
						if (n.changeInput) {
							switch ((typeof n.changeInput + "").toLowerCase()) {
								case 'boolean':
									o = $('<div class="fileuploader-input">' +
										  	'<div class="fileuploader-input-caption"><span>' + f._assets.textParse(n.captions.feedback) + '</span></div>' + 
										  	'<div class="fileuploader-input-button"><span>' + f._assets.textParse(n.captions.button) + '</span></div>' + 
										  '</div>');
									break;
								case 'string':
									if (n.changeInput != ' ')
                                    	o = $(f._assets.textParse(n.changeInput, n));
									break;
								case 'object':
									o = $(n.changeInput);
									break;
								case 'function':
									o = $(n.changeInput(s, p, n, f._assets.textParse));
									break;
							}
							
                            // add the new input after standard input
							s.after(o);
                            
                            // hide the standard input
							s.css({
								position: "absolute",
								"z-index": "-9999",
								height: '0',
								width: '0',
								padding: '0',
								margin: '0',
								"line-height": '0',
								outline: '0',
								border: '0',
								opacity: '0'
							});
						}
						
						
						// create thumbnails list
						if (n.thumbnails)
							f.thumbnails.create();
						
						// set drag&drop container
						if (n.dragDrop) {
							n.dragDrop = typeof(n.dragDrop) != 'object' ? {container: null} : n.dragDrop;
							n.dragDrop.container = n.dragDrop.container ? $(n.dragDrop.container) : o;
						}
					},
					
					/**
					 * clickHandler
					 * click event for new input
					 *
                     * @param {Event} e - jQuery event
					 * @void
					 */
					clickHandler: function(e) {
						e.preventDefault();
                        
                        // clear clipboard pending
                        if (f.clipboard._timer) {
                            f.clipboard.clean();
                            return;
                        }
						
						// trigger input click
						s.click();
					},
					
					/**
					 * onEvent
					 * callbacks for each input event
					 *
                     * @param {Event} e - jQuery event
					 * @void
					 */
					onEvent: function(e) {
						switch(e.type) {
							case 'focus':
								p ? p.addClass('fileuploader-focused') : null;
								break;
							case 'blur':
								p ? p.removeClass('fileuploader-focused') : null;
								break;
							case 'change':
								f.onChange.call(this);
								break;
						}
						
						// listeners callback
						n.listeners && $.isFunction(n.listeners[e.type]) ? n.listeners[e.type].call(s, p) : null;
					},
					
					
					/**
					 * set
					 * set properties
					 *
                     * @param {String} type - property type
                     * @param {null|String} value - property value
					 * @void
					 */
					set: function(type, value) {
						switch(type) {
							case 'attrOpts':
								var d = ['limit', 'maxSize', 'fileMaxSize', 'extensions', 'changeInput', 'theme', 'addMore', 'listInput', 'files'];
								for (var k = 0; k < d.length; k++) {
									var j = 'data-fileuploader-' + d[k];
									if (f._assets.hasAttr(j)) {
										switch (d[k]) {
											case 'changeInput':
											case 'addMore':
											case 'listInput':
												n[d[k]] = (['true', 'false'].indexOf(s.attr(j)) > -1 ? s.attr(j) == 'true' : s.attr(j));
												break;
											case 'extensions':
												n[d[k]] = s.attr(j)
													.replace(/ /g, '')
													.split(',');
												break;
											case 'files':
												n[d[k]] = JSON.parse(s.attr(j));
												break;
											default:
												n[d[k]] = s.attr(j);
										}
									}
									s.removeAttr(j);
								}
								
								// set the plugin on disabled if the input has disabled attribute or limit is 0
								if (s.attr('disabled') != null || s.attr('readonly') != null || n.limit === 0)
									f.disabled = true;
								
								// set multiple attribute to the input
								if (!n.limit || (n.limit && n.limit >= 2)) {
									s.attr('multiple', 'multiple');
                                    // set brackets at the end of input name
									n.inputNameBrackets && s.attr('name').slice(-2) != '[]' ? s.attr('name', s.attr('name') + '[]') : null;
								}
								
								// set list input element
								if (n.listInput === true) {
									n.listInput = $('<input type="hidden" name="fileuploader-list-' + s.attr('name').replace('[]', '').split('[').pop().replace(']', '') + '">').insertBefore(s);
								}
								if (typeof n.listInput == "string" && $(n.listInput).length == 0) {
									n.listInput = $('<input type="hidden" name="' + n.listInput + '">').insertBefore(s);
								}
								
								// apply some defined options to plugin
								f.set('disabled', f.disabled);
								if (!n.fileMaxSize && n.maxSize)
									n.fileMaxSize = n.maxSize;
								break;
							// set and apply disable option to plugin
							case 'disabled':
								f.disabled = value;
								p[f.disabled ? 'addClass' : 'removeClass']('fileuploader-disabled');
								s[f.disabled ? 'attr' : 'removeAttr']('disabled', 'disabled');
								
								if (f.rendered)
									f.bindUnbindEvents(!value);
								break;
							// set new input feedback html
							case 'feedback':
                                if (!value)
                                    value = f._assets.textParse(f._itFl.length > 0 ? n.captions.feedback2 : n.captions.feedback, {length: f._itFl.length});
                                
                                $(!o.is(':file')) ? o.find('.fileuploader-input-caption span').html(value) : null;
                                break;
							// set file input value to empty
							case 'input':
                                var el = f._assets.copyAllAttributes($('<input type="file">'), s, true);
                                
                                f.bindUnbindEvents(false);
								s.after(s = el).remove();
                                f.bindUnbindEvents(true);
								break;
							// set previous input; only for addMore option
							case 'prevInput':
								if (sl.length > 0) {
									f.bindUnbindEvents(false);
									sl[value].remove();
									sl.splice(value, 1);
									s = sl[sl.length - 1];
									f.bindUnbindEvents(true);
								}
								break;
							// set next input; only for addMore option
							case 'nextInput':
								var el = f._assets.copyAllAttributes($('<input type="file">'), s);
                                
								f.bindUnbindEvents(false);
								if (sl.length > 0 && sl[sl.length - 1].get(0).files.length == 0) {
									s = sl[sl.length - 1];
								} else {
									sl.indexOf(s) == -1 ? sl.push(s) : null;
									sl.push(el);
									s.after(s = el);
								}
								f.bindUnbindEvents(true);
								break;
							// set list input with list of the files
							case 'listInput':
								if (n.listInput)
                                    n.listInput.val(f.files.list(true, null, false, value));
								break;
						}
					},
					
					/**
					 * onChange
					 * on input change event
					 *
                     * @param {Event} e - jQuery event
                     * @param {Array} fileList - FileList array, used only by drag&drop and clipboard paste
					 * @void
					 */
					onChange: function(e, fileList) {
						var files = s.get(0).files;
						
						// drag&drop or clipboard paste
						if (fileList) {
							if (fileList.length) {
                                files = fileList;
                            } else {
                                f.set('input', '');
                                f.files.clear();
                                return false;
							}
							
						}
                        
                        // clean clipboard timer
                        // made only for safety
                        if (f.clipboard._timer)
                            f.clipboard.clean();
						
						// reset the input if default mode
						if (f.isDefaultMode()) {
							f.reset();
							
							if (files.length == 0)
								return;
						}
						
						// beforeSelect callback
						if (n.beforeSelect && $.isFunction(n.beforeSelect) && n.beforeSelect(files, l, p, o, s) == false) {
                            return false;
                        }
						
						// files
                        var t = 0; // total processed files
						for (var i = 0; i < files.length; i++ ) {
							var file = files[i], // file
								item = f._itFl[f.files.add(file, 'choosed')], // item
								status = f.files.check(item, files, i == 0); // ["type", "message", "do not show the warning message", "do not check the next files"]
                            
                            // process the warnings
							if (status !== true) {
								f.files.remove(item, true);
								
								if (!status[2]) {
									if (f.isDefaultMode()) {
										f.set('input', '');
										f.reset();
										status[3] = true;
									}
                                    
									status[1] ? n.dialogs.alert(status[1], item, l, p, o, s) : null;
								}
								
								if (status[3]) {
									break;
								}
								
								continue;
							}
							
							// file is valid
							// create item html
							if (n.thumbnails)
								f.thumbnails.item(item);
								
							// create item ajax request
							if (f.isUploadMode())
								f.upload.prepare(item);
							
							// onSelect callback
							n.onSelect && $.isFunction(n.onSelect) ? n.onSelect(item, l, p, o, s) : null;
							
                            t++;
						}
						
                        // clear the input in uploadMode
                        if (f.isUploadMode() && t > 0)
                            f.set('input', '');
						
						// set feedback caption
						f.set('feedback', null);
						
						// set nextInput for addMore option
						if (f.isAddMoreMode() && t > 0) {
							f.set('nextInput');
						}
						
                        // set listInput value
						f.set('listInput', null);
                        
						// afterSelect callback
						n.afterSelect && $.isFunction(n.afterSelect) ? n.afterSelect(l, p, o, s) : null;
					},
                    
					/**
                     * @namespace thumbnails
                     */
					thumbnails: {
                        /**
                         * create
                         * create the thumbnails list
                         *
						 * @namespace thumbnails
                         * @void
                         */
						create: function() {
							// thumbnails.beforeShow callback
							n.thumbnails.beforeShow != null && $.isFunction(n.thumbnails.beforeShow) ? n.thumbnails.beforeShow(p, o, s) : null;
                            
							// create item's list element
							var box = $(f._assets.textParse(n.thumbnails.box)).appendTo(n.thumbnails.boxAppendTo ? n.thumbnails.boxAppendTo : p);
							l = !box.is(n.thumbnails._selectors.list) ? box.find(n.thumbnails._selectors.list) : box;
							
                            // bind item popup method to the selector
                            if (n.thumbnails._selectors.popup_open) {
                                l.on('click', n.thumbnails._selectors.popup_open, function(e) {
                                    e.preventDefault();
                                    
                                    var m = $(this).closest(n.thumbnails._selectors.item),
                                        item = f.files.find(m);
                                    
                                    if (item && item.html.hasClass('file-has-popup'))
                                        f.thumbnails.popup(item);
                                });
                            }
							// bind item upload start method to the selector
                            if (f.isUploadMode() && n.thumbnails._selectors.start) {
                                l.on('click', n.thumbnails._selectors.start, function(e) {
									e.preventDefault();
                                    
                                    if (f.locked)
                                        return false;

									var m = $(this).closest(n.thumbnails._selectors.item),
                                        item = f.files.find(m);
                                    
                                    if (item)
                                        f.upload.send(item, true);
								});
                            }
							// bind item upload retry method to the selector
                            if (f.isUploadMode() && n.thumbnails._selectors.retry) {
                                l.on('click', n.thumbnails._selectors.retry, function(e) {
									e.preventDefault();
                                    
                                    if (f.locked)
                                        return false;

									var m = $(this).closest(n.thumbnails._selectors.item),
                                        item = f.files.find(m);
                                    
                                    if (item)
                                        f.upload.retry(item);
								});
                            }
                            // bind item remove / upload.cancel method to the selector
							if (n.thumbnails._selectors.remove) {
								l.on('click', n.thumbnails._selectors.remove, function(e) {
									e.preventDefault();
                                    
                                    if (f.locked)
                                        return false;

									var m = $(this).closest(n.thumbnails._selectors.item),
                                        item = f.files.find(m),
										c = function(a) {
											f.files.remove(item);
										};
                                    
                                    if (item) {
                                        if (item.upload && item.upload.status != 'successful') {
                                            f.upload.cancel(item);
                                        } else {
                                            if (n.thumbnails.removeConfirmation) {
                                                n.dialogs.confirm(f._assets.textParse(n.captions.removeConfirmation, item), c);
                                            } else {
                                                c();
                                            }
                                        }
                                    }
								});
							}
						},
                        /**
                         * clear
                         * set the HTML content from items list to empty
                         *
						 * @namespace thumbnails
                         * @void
                         */
						clear: function() {
							if (l)
								l.html('');
						},
                        /**
                         * item
                         * create the item.html and append it to the list
                         *
						 * @namespace thumbnails
                         * @param {Object} item
                         * @void
                         */
						item: function(item) {
							item.icon = f.thumbnails.generateFileIcon(item.format, item.extension);
							item.image = '<div class="fileuploader-item-image fileuploader-loading"></div>';
							item.progressBar = f.isUploadMode() ? '<div class="fileuploader-progressbar"><div class="bar"></div></div>' : '';
							item.html = $(f._assets.textParse(item.appended && n.thumbnails.item2 ? n.thumbnails.item2 : n.thumbnails.item, item));
							item.progressBar = item.html.find('.fileuploader-progressbar');
                            
                            // add class with file extension and file format to item html
                            item.html.addClass('file-type-' + (item.format ? item.format : 'no') + ' file-ext-' + (item.extension ? item.extension : 'no') + '');
                            
							// add item html to list element
							item.html[n.thumbnails.itemPrepend ? 'prependTo' : 'appendTo'](l);
							
							// render the image thumbnail
                            f.thumbnails.renderThumbnail(item);
							item.renderThumbnail = function(src) { f.thumbnails.renderThumbnail(item, true, src); };
                            item.popup = { open: function() { f.thumbnails.popup(item); } };
							
							// thumbnails.onItemShow callback
							n.thumbnails.onItemShow != null && $.isFunction(n.thumbnails.onItemShow) ? n.thumbnails.onItemShow(item, l, p, o, s) : null;
						},
						/**
                         * generateFileIcon
                         * generate a file icon with custom background color
                         *
						 * @namespace thumbnails
                         * @param {String} form - file format
						 * @param {String} extension - file extension
                         * @return {String} html element
                         */
						generateFileIcon: function(format, extension) {
                            var el = '<div style="${style}" class="fileuploader-item-icon' + '${class}"><i>' + (extension ? extension : '') + '</i></div>';
							
							// set generated color to icon background
							var bgColor = f._assets.textToColor(extension);
							bgColor =  "#e6e6e6";
							if (bgColor) {
								var isBgColorBright = f._assets.isBrightColor(bgColor);
								if (isBgColorBright)
									el = el.replace('${class}', ' is-bright-color');
								el = el.replace('${style}', 'background-color: ' + bgColor);
							}
							
                            return el.replace('${style}', '').replace('${class}', '');
						},
						/**
                         * renderThumbnail
                         * render image thumbnail and append to .fileuploader-item-image element
						 * it appends the generated icon if the file is not an image or not a valid image
                         *
						 * @namespace thumbnails
                         * @param {Object} item
						 * @param {bool} forceRender - skip the synchron functions and force the rendering
						 * @param {string} src - custom image source
                         * @void
                         */
						renderThumbnail: function(item, forceRender, src) {
							var m = item.html.find('.fileuploader-item-image'),
								readerSkip = item.data && item.data.readerSkip,
								setImageThumb = function(img) {
									var $img = $(img);
									
									// add $img to html
									m.removeClass('fileuploader-no-thumbnail fileuploader-loading').html($img);
									
									// add onImageLoaded callback
                                    if ($img.is('img'))
                                        $img.attr('draggable', 'false').on('load error', function(e) {
                                            if (e.type == 'error')
                                                setIconThumb();
                                            renderNextItem();
                                            n.thumbnails.onImageLoaded != null && $.isFunction(n.thumbnails.onImageLoaded) ? n.thumbnails.onImageLoaded(item, l, p, o, s) : null;
                                        });
									
									if ($img.is('canvas'))
										n.thumbnails.onImageLoaded != null && $.isFunction(n.thumbnails.onImageLoaded) ? n.thumbnails.onImageLoaded(item, l, p, o, s) : null;
								},
								setIconThumb = function() {
									m.addClass('fileuploader-no-thumbnail');
									m.removeClass('fileuploader-loading').html(item.icon);
								},
								renderNextItem = function() {
									var i = 0;
									
									if (item && f._pfrL.indexOf(item) > -1) {
										f._pfrL.splice(f._pfrL.indexOf(item), 1);
										while (i < f._pfrL.length) {
											if (f._itFl.indexOf(f._pfrL[i]) > -1) {
												f.thumbnails.renderThumbnail(f._pfrL[i], true);
												break;
											} else {
												f._pfrL.splice(i, 1);
											}
                                            i++;
										}
									}
								};
							
							// skip this function if there is no place for image
							if (!m.length) {
								renderNextItem();
								return;
							}
							
							// set item.image to jQuery element
							item.image = m;
							
							// create an image thumbnail only if file is an image and if FileReader is supported
							if (['image', 'video', 'audio', 'astext'].indexOf(item.format) > -1 && f.isFileReaderSupported() && !readerSkip && (item.appended || n.thumbnails.startImageRenderer || forceRender)) {
								// check pending list
								if (n.thumbnails.synchronImages) {
									f._pfrL.indexOf(item) == -1 && !forceRender ? f._pfrL.push(item) : null;
									if (f._pfrL.length > 1 && !forceRender) {
										return;
									}
								}
								
								// create thumbnail
                                var load = function(data, fromReader) {
									var srcIsImg = data.nodeName && data.nodeName.toLocaleLowerCase() == 'img',
										src = !srcIsImg ? data : data.src;
									
                                    if (n.thumbnails.canvasImage) {
                                        var canvas = document.createElement('canvas'),
											img = srcIsImg ? data : new Image(),
                                            onload = function() {
												// resize canvas
                                                f.editor.resize(img, canvas, n.thumbnails.canvasImage.width ? n.thumbnails.canvasImage.width : m.width(), n.thumbnails.canvasImage.height ? n.thumbnails.canvasImage.height : m.height(), false, true);

                                                // check if canvas is not blank
                                                if (!f._assets.isBlankCanvas(canvas)) {
                                                    setImageThumb(canvas);
                                                } else {
                                                    setIconThumb();
                                                }

                                                // render the next pending item
                                                renderNextItem();
                                            },
                                            onerror = function(text) {
                                                setIconThumb();
                                                renderNextItem();
                                                img = null;
                                            };
                                        
                                        // do not create another image element
                                        if (item.format == 'image' && fromReader && item.reader.node) {
                                            img = item.reader.node;
                                            return onload();
                                        }
                                        
                                        // do not create an empty image element
                                        if(!src)
                                            return onerror();
										
										if (srcIsImg)
											return onload.call(data);
                                        
                                        // create image element
                                        img.onload = onload;
                                        img.onerror = onerror;
										if (item.data && item.data.readerCrossOrigin)
											img.setAttribute('crossOrigin', item.data.readerCrossOrigin);
                                        img.src = src;
                                    } else {
                                        setImageThumb(srcIsImg ? src : '<img src="'+ src +'">');
                                    }
                                };
                                
                                // choose thumbnail source
                                if (src)
                                    return load(src);
                                else
                                    return f.files.read(item, function() {
                                        if (item.reader.node && n.thumbnails.popup)
                                            item.html.addClass('file-has-popup');
                                        
                                        if (item.reader.node && (item.format == 'image' || item.format == 'video')) {
                                            load(item.reader.frame || item.reader.src, true);
                                        } else {
                                            setIconThumb();
                                            renderNextItem();
                                        }
                                    });
							}
							
							setIconThumb();
						},
                        /**
                         * popup
                         * create and show a popup for an item
                         * appends the popup to parent element
						 * reset values for the editor
                         *
						 * @namespace thumbnails
                         * @param {Object} item
                         * @void
                         */
                        popup: function(item) {
                            if (!n.thumbnails.popup || !n.thumbnails._selectors.popup)
                                return;
                            
                            // remove all created popups
                            if (p.find(n.thumbnails._selectors.popup).length) {
                                $.each(f._itFl, function(i, a) {
                                    if (a.popup && a.popup.close) {
                                        a.popup.close();
                                    }
                                });
                            }
                            
                            var template = item.popup.html || $(f._assets.textParse(n.thumbnails.popup.template, item)),
								popupIsNew = item.popup.html !== template,
								windowResizeEvent = function() {
									var $parent = item.popup.html.find('.fileuploader-popup-preview'),
										$node = $parent.find('.node'),
										$tools = $parent.find('.tools'),
										$childEl = $node.find('> *'),
										height = $parent.height() - $tools.outerHeight(true);

									// get child height
									$node.css({height: '100%'});
									if ($childEl && height > $childEl.outerHeight())
										height = $childEl.outerHeight();

									$node.css({
										height: height
									});
								},
                                windowKeyEvent = function(e) {
                                    var key = e.which || e.keyCode;
                                    
                                    if (key == 27 && item.popup && item.popup.close)
                                        item.popup.close();
                                };
                            
                            template.show().appendTo(p);
                            item.popup.html = template;
                            item.popup.close = function() {
                                if (item.reader.node) {
                                    item.reader.node.pause ? item.reader.node.pause() : null;
                                }
								
                                $(window).off('keyup', windowKeyEvent);
                                $(window).off('resize', windowResizeEvent);
								
								// hide the cropper
								if (item.popup.editor && item.popup.editor.cropper)
									item.popup.editor.cropper.hide();
                                
                                // thumbnails.popup.onHide callback
                                item.popup.html && n.thumbnails.popup.onHide && $.isFunction(n.thumbnails.popup.onHide) ? n.thumbnails.popup.onHide(item, l, p, o, s) : (item.popup.html ? item.popup.html.remove() : null);
                                
                                delete item.popup.close;
                            };
                            
                            // append item.reader.node to popup
                            // play video/audio
                            if (item.reader.node) {
								if (popupIsNew)
                                	template.find('.fileuploader-popup-preview .node').html(item.reader.node);
                                item.reader.node.controls = true;
                                item.reader.node.currentTime = 0;
                                item.reader.node.play ? item.reader.node.play() : null;
                            }
                            
                            // bind Window functions
                            $(window).on('keyup', windowKeyEvent);
                            $(window).on('resize', windowResizeEvent);
							windowResizeEvent.call();
							
							// IE dirty fix
							setTimeout(function() {
								windowResizeEvent.call();
							}, 10);
							
							// popup editor
							if (item.editor && item.popup.editor && item.popup.editor.hasChanges) {
								// set saved rotation
								if (item.popup.editor && item.popup.editor.rotation)
									f.editor.rotate(item, item.editor.rotation || 0, true);
								
								// set saved crop
								if (item.popup.editor && item.popup.editor.cropper) {
									item.popup.editor.cropper.hide(true);
									setTimeout(function() {
										f.editor.crop(item, item.editor.crop ? $.extend({}, item.editor.crop) : item.popup.editor.cropper.setDefaultData());
									}, 100);
								}
							} else {
								item.popup.editor = {};
							}
                            
                            // thumbnails.popup.onShow callback
                            n.thumbnails.popup.onShow && $.isFunction(n.thumbnails.popup.onShow) ? n.thumbnails.popup.onShow(item, l, p, o, s) : null;
                        }
					},
					
					/**
                     * @namespace editor
                     */
					editor: {
						/**
                         * rotate
                         * rotate image action
						 * animate rotation in popup, only when popup is enabled
                         *
						 * @namespace editor
                         * @param {Object} item
                         * @param {Number} degrees - rotation degrees
                         * @param {Boolean} force - force rotation without animation to degrees
                         * @void
                         */
						rotate: function(item, degrees, force) {
							var inPopup = item.popup && typeof item.popup.html !== "undefined";
							
							if (!inPopup) {
								var rotation = item.editor.rotation || 0;
								
								return item.editor.rotation = degrees ? degrees : rotation + 90;
							} else {
								
								// prevent animation issues
								if (item.popup.editor.isAnimating)
									return;
								item.popup.editor.isAnimating = true;
								
								var $popup = item.popup.html,
									$node = $popup.find('.node'),
									$imageEl = $node.find('> img'),
									rotation = item.popup.editor.rotation || 0,
									scale = item.popup.editor.scale || 1,
									animationObj = {
										rotation: rotation,
										scale: scale
									};
								
								// hide cropper
								if (item.popup.editor.cropper)
									item.popup.editor.cropper.$template.hide();
								
								// change values
								item.popup.editor.rotation = force ? degrees : rotation + 90;
								item.popup.editor.scale = ($node.height() / $imageEl[[90,270].indexOf(item.popup.editor.rotation) > -1 ? 'width' : 'height']()).toFixed(3);
								if ($imageEl.height() * item.popup.editor.scale > $node.width() && [90,270].indexOf(item.popup.editor.rotation) > -1)
									item.popup.editor.scale = $node.width() / $imageEl.height();
								if (item.popup.editor.scale > 1)
									item.popup.editor.scale = 1;
								
								// animate
								$(animationObj).animate({
									rotation: item.popup.editor.rotation,
									scale: item.popup.editor.scale
								}, {
									duration: force ? 1 : 300,
									easing: 'swing',
									step: function(now, fx) {
										var matrix = $imageEl.css('-webkit-transform') || $imageEl.css('-moz-transform') || $imageEl.css('transform') || 'none',
											rotation = 0,
											scale = 1,
											prop = fx.prop;
										
										// get css matrix
										if (matrix !== 'none') {
											var values = matrix.split('(')[1].split(')')[0].split(','),
												a = values[0],
												b = values[1];

											rotation = prop == 'rotation' ? now : Math.round(Math.atan2(b, a) * (180/Math.PI));
											scale = prop == 'scale' ? now : Math.round(Math.sqrt(a*a + b*b) * 10) / 10;
										}
										
										// set $imageEl css
										$imageEl.css({
											'-webkit-transform': 'rotate('+ rotation +'deg) scale('+ scale +')',
											'-moz-transform': 'rotate('+ rotation +'deg) scale('+ scale +')',
											'transform': 'rotate('+ rotation +'deg) scale('+ scale +')'
										});
									},
									always: function() {
										delete item.popup.editor.isAnimating;
										
										// re-draw the cropper if exists
										if (item.popup.editor.cropper && !force) {
											item.popup.editor.cropper.setDefaultData();
											item.popup.editor.cropper.init('rotation');
										}
									}
								});
								
								// check if rotation no greater than 360 degrees
								if (item.popup.editor.rotation >= 360)
									item.popup.editor.rotation = 0;
								
								// register as change
								if (item.popup.editor.rotation != item.editor.rotation)
									item.popup.editor.hasChanges = true;
							}
						},
						
						/**
                         * crop
                         * crop image action
						 * show cropping tools, only when popup is enabled
                         *
						 * @namespace editor
                         * @param {Object} item
                         * @param {Object} data - cropping data
                         * @void
                         */
						crop: function(item, data) {
							var inPopup = item.popup && typeof item.popup.html !== "undefined";
							
							if (!inPopup) {
								return item.editor.crop = data || item.editor.crop;
							} else {
								if (!item.popup.editor.cropper) {
									var template = '<div class="fileuploader-cropper">' +
											'<div class="fileuploader-cropper-area">' +
												'<div class="point point-a"></div>' +
												'<div class="point point-b"></div>' +
												'<div class="point point-c"></div>' +
												'<div class="point point-d"></div>' +
												'<div class="point point-e"></div>' +
												'<div class="point point-f"></div>' +
												'<div class="point point-g"></div>' +
												'<div class="point point-h"></div>' +
												'<div class="area-move"></div>' +
												'<div class="area-image"></div>' +
											'</div>' +
										'</div>',
										$popup = item.popup.html,
										$imageEl = $popup.find('.node > img'),
										$template = $(template),
										$editor = $template.find('.fileuploader-cropper-area');
									
									// define popup cropper tool
									item.popup.editor.cropper = {
										$imageEl: $imageEl,
										$template: $template,
										$editor: $editor,
										isCropping: false,
										crop: data || null,
										init: function(data) {
											var cropper = item.popup.editor.cropper,
												position = cropper.$imageEl.position(),
												width = cropper.$imageEl[0].getBoundingClientRect().width,
												height = cropper.$imageEl[0].getBoundingClientRect().height,
												isInverted = item.popup.editor.rotation && [90,270].indexOf(item.popup.editor.rotation) > -1,
												scale = isInverted ? item.popup.editor.scale : 1;
											
											// unbind all events
											cropper.hide();
											
											// set default data
											if (!cropper.crop)
												cropper.setDefaultData();
											
											// hide if image not visible
											if (width == 0 || height == 0)
												return cropper.hide(true);

											// prevent duplicates
											if (!cropper.isCropping) {
												cropper.$imageEl.clone().appendTo(cropper.$template.find('.area-image'));
												cropper.$imageEl.parent().append($template);
											}

											// animate cropping tool
											cropper.$template.hide().css({
												left: position.left,
												top: position.top,
												width: width,
												height: height
											}).fadeIn(150);
											cropper.$editor.hide();
											clearTimeout(cropper._editorAnimationTimeout);
											cropper._editorAnimationTimeout = setTimeout(function() {
												delete cropper._editorAnimationTimeout;
												
												cropper.$editor.fadeIn(250);
												
												// update data with cf and scale
												if (item.editor.crop && $.isPlainObject(data)) {
													cropper.resize();
													cropper.crop.left = cropper.crop.left * cropper.crop.cfWidth * scale;
													cropper.crop.width = cropper.crop.width * cropper.crop.cfWidth * scale;
													cropper.crop.top = cropper.crop.top * cropper.crop.cfHeight * scale;
													cropper.crop.height = cropper.crop.height * cropper.crop.cfHeight * scale;
												}
												
												// ratio on open
												if ((!item.editor.crop || data == 'rotation') && (n.editor.cropper && n.editor.cropper.ratio && data != 'resize')) {
													var ratio = n.editor.cropper.ratio,
														ratioPx = f._assets.ratioToPx(cropper.crop.width, cropper.crop.height, ratio);

													if (ratioPx) {
														cropper.crop.width = Math.min(cropper.crop.width, ratioPx[0]);
														cropper.crop.left = (cropper.$template.width() - cropper.crop.width) / 2;
														cropper.crop.height = Math.min(cropper.crop.height, ratioPx[1]);
														cropper.crop.top = (cropper.$template.height() - cropper.crop.height) / 2;
													}
												}
												
												// draw editor
												cropper.drawPlaceHolder(cropper.crop);
											}, 400);

											// start and bind events
											if (!cropper.isCropping)
												cropper.$template.on('drop dragend dragleave dragover dragenter dragstart touchstart touchmove touchend touchcancel', function(e) { e.preventDefault(); });
											if (n.editor.cropper && n.editor.cropper.showGrid)
												cropper.$editor.addClass('has-grid');
											cropper.$imageEl.attr('draggable', 'false');
											cropper.$template.on('mousedown touchstart', cropper.mousedown);
											$(window).on('resize', cropper.resize);

											// register as changed
											cropper.isCropping = true;
											item.popup.editor.hasChanges = true;
										},
										setDefaultData: function() {
											var cropper = item.popup.editor.cropper,
												$imageEl = cropper.$imageEl,
												width = $imageEl.width(),
												height = $imageEl.height(),
												isInverted = item.popup.editor.rotation && [90,270].indexOf(item.popup.editor.rotation) > -1,
												scale = item.popup.editor.scale || 1;
											
											// set default data
											cropper.crop = {
												left: 0,
												top: 0,
												width: isInverted ? height * scale : width,
												height: isInverted ? width * scale : height,
												cfWidth: width / cropper.$imageEl.prop('naturalWidth'),
												cfHeight: height / cropper.$imageEl.prop('naturalHeight')
											};
											
											return null;
										},
										hide: function(force) {
											var cropper = item.popup.editor.cropper;
											
											// hide editor on force
											if (force) {
												cropper.$template.hide();
												cropper.$editor.hide();
											}
											
											// stop and unbind events
											cropper.$imageEl.attr('draggable', '');
											cropper.$template.off('mousedown touchstart', cropper.mousedown);
											$(window).off('resize', cropper.resize);
										},
										resize: function(e) {
											var cropper = item.popup.editor.cropper,
												$imageEl = cropper.$imageEl;
											
											// only when image is visible
											if ($imageEl.width() > 0) {
												if (!e) {
													// re-write cf
													cropper.crop.cfWidth = $imageEl.width() / $imageEl.prop('naturalWidth');
													cropper.crop.cfHeight = $imageEl.height() / $imageEl.prop('naturalHeight');
												} else {
													// resize $editor
													cropper.$template.hide();
													clearTimeout(cropper._resizeTimeout);
													cropper._resizeTimeout = setTimeout(function() {
														delete cropper._resizeTimeout;
														var cfWidth = $imageEl.width() / $imageEl.prop('naturalWidth'),
															cfHeight = $imageEl.height() / $imageEl.prop('naturalHeight');
														
														cropper.crop.left = cropper.crop.left / cropper.crop.cfWidth * cfWidth;
														cropper.crop.width = cropper.crop.width / cropper.crop.cfWidth * cfWidth;
														cropper.crop.top = cropper.crop.top / cropper.crop.cfHeight * cfHeight;
														cropper.crop.height = cropper.crop.height / cropper.crop.cfHeight * cfHeight;
														cropper.crop.cfWidth = cfWidth;
														cropper.crop.cfHeight = cfHeight;
														
														cropper.init('resize');
													}, 400);
												}
											}
										},
										drawPlaceHolder: function(css) {
											var cropper = item.popup.editor.cropper,
												rotation = item.popup.editor.rotation || 0,
												scale = item.popup.editor.scale || 1,
												translate = [0, 0];

											if (!css)
												return;
											
											// create new object
											css = $.extend({}, css);
											
											// edit width, height and translate values by rotation
											if (rotation)
												translate = [rotation == 180 || rotation == 270 ? -100 : 0, rotation == 90 || rotation == 180 ? -100 : 0];
											
											// draw cropping-area
											cropper.$editor.css(css);
											cropper.$editor.find('.area-image img').removeAttr('style').css({
												width: cropper.$imageEl.width(),
												height: cropper.$imageEl.height(),
												left: cropper.$editor.position().left * -1,
												top: cropper.$editor.position().top * -1,
												
												'-webkit-transform': 'rotate('+ rotation +'deg) scale('+ scale +') translateX('+ translate[0] +'%) translateY('+ translate[1] +'%)',
												'-moz-transform': 'rotate('+ rotation +'deg) scale('+ scale +') translateX('+ translate[0] +'%) translateY('+ translate[1] +'%)',
												'transform': 'rotate('+ rotation +'deg) scale('+ scale +') translateX('+ translate[0] +'%) translateY('+ translate[1] +'%)'
											});
										},
										mousedown: function(e) {
											var eventType = e.originalEvent.touches && e.originalEvent.touches[0] ? 'touchstart' : 'mousedown',
												$target = $(e.target),
												cropper = item.popup.editor.cropper,
												points = {
													x: (eventType == 'mousedown' ? e.pageX : e.originalEvent.touches[0].pageX) - cropper.$template.offset().left,
													y: (eventType == 'mousedown' ? e.pageY : e.originalEvent.touches[0].pageY) - cropper.$template.offset().top
												},
												callback = function() {
													// set current state
													cropper.pointData = {
														el: $target,
														x: points.x,
														y: points.y,
														xEditor: points.x - cropper.crop.left,
														yEditor: points.y - cropper.crop.top,
														left: cropper.crop.left,
														top: cropper.crop.top,
														width: cropper.crop.width,
														height: cropper.crop.height
													};

													// determinate cropping type
													if ($target.is('.area-move'))
														cropper.isMoving = true;
													if ($target.is('.point'))
														cropper.isResizing = true;

													// start cropping event
													if (cropper.isMoving || cropper.isResizing) {
														cropper.$editor.addClass('moving');
														$('body').css({
															'-webkit-user-select': 'none',
															'-moz-user-select': 'none',
															'-ms-user-select': 'none',
															'user-select': 'none'
														});

														// bind window mousemove event
														$(window).on('mousemove touchmove', cropper.mousemove);
													}
												};

											// mousedown event
											if (eventType == 'mousedown') {
												// bind cropping start event
												callback();
											}

											// touchstart event
											if (eventType == 'touchstart') {
												cropper.isTouchLongPress = true;

												// check if long press
												setTimeout(function() {
													if (!cropper.isTouchLongPress)
														return;
													delete cropper.isTouchLongPress;
													callback();
												}, 500);
											}

											// bind window mouseup event
											$(window).on('mouseup touchend', cropper.mouseup);
										},
										mousemove: function(e) {
											var eventType = e.originalEvent.touches && e.originalEvent.touches[0] ? 'touchstart' : 'mousedown',
												$target = $(e.target),
												cropper = item.popup.editor.cropper,
												points = {
													x: (eventType == 'mousedown' ? e.pageX : e.originalEvent.touches[0].pageX) - cropper.$template.offset().left,
													y: (eventType == 'mousedown' ? e.pageY : e.originalEvent.touches[0].pageY) - cropper.$template.offset().top
												};

											// move
											if (cropper.isMoving) {
												var left = points.x - cropper.pointData.xEditor,
													top = points.y - cropper.pointData.yEditor;

												// position
												if (left + cropper.crop.width > cropper.$template.width())
													left = cropper.$template.width() - cropper.crop.width;
												if (left < 0)
													left = 0;
												if (top + cropper.crop.height > cropper.$template.height())
													top = cropper.$template.height() - cropper.crop.height;
												if (top < 0)
													top = 0;

												// set position
												cropper.crop.left = left;
												cropper.crop.top = top;
											}

											// resize
											if (cropper.isResizing) {
												var point = cropper.pointData.el.attr('class').substr("point point-".length),
													lastWidth = cropper.crop.left + cropper.crop.width,
													lastHeight = cropper.crop.top + cropper.crop.height,
													minWidth = (n.editor.cropper && n.editor.cropper.minWidth || 0) * cropper.crop.cfWidth,
													minHeight = (n.editor.cropper && n.editor.cropper.minWidth || 0) * cropper.crop.cfHeight,
													ratio = n.editor.cropper ? n.editor.cropper.ratio : null,
													ratioPx;

												// set minWidth if greater than image
												if (minWidth > cropper.$template.width())
													minWidth = cropper.$template.width();
												if (minHeight > cropper.$template.height())
													minHeight = cropper.$template.height();

												// points
												if ((point == 'a' || point == 'b' || point == 'c') && !ratioPx) {
													cropper.crop.top = points.y;
													if (cropper.crop.top < 0)
														cropper.crop.top = 0;

													cropper.crop.height = lastHeight - cropper.crop.top;
													if (cropper.crop.top > cropper.crop.top + cropper.crop.height) {
														cropper.crop.top = lastHeight;
														cropper.crop.height = 0;
													}

													// minHeight
													if (cropper.crop.height < minHeight) {
														cropper.crop.top = lastHeight - minHeight;
														cropper.crop.height = minHeight;
													}
													
													// ratio
													ratioPx = ratio ? f._assets.ratioToPx(cropper.crop.width, cropper.crop.height, ratio) : null;
													if (ratioPx) {
														cropper.crop.width = ratioPx[0];
														
														if (point == 'a' || point == 'b')
															cropper.crop.left = Math.max(0, cropper.pointData.left + ((cropper.pointData.width - cropper.crop.width) / (point == 'b' ? 2 : 1)));
														
														// check
														if (cropper.crop.left + cropper.crop.width > cropper.$template.width()) {
															var newWidth = cropper.$template.width() - cropper.crop.left;

															cropper.crop.width = newWidth;
															cropper.crop.height = newWidth / ratioPx[2] * ratioPx[3];
															cropper.crop.top = lastHeight - cropper.crop.height;
														}
													}
												}
												if ((point == 'e' || point == 'f' || point == 'g') && !ratioPx) {
													cropper.crop.height = points.y - cropper.crop.top;
													if (cropper.crop.height + cropper.crop.top > cropper.$template.height())
														cropper.crop.height = cropper.$template.height() - cropper.crop.top;

													// minHeight
													if (cropper.crop.height < minHeight)
														cropper.crop.height = minHeight;
													
													// ratio
													ratioPx = ratio ? f._assets.ratioToPx(cropper.crop.width, cropper.crop.height, ratio) : null;
													if (ratioPx) {
														cropper.crop.width = ratioPx[0];
														
														if (point == 'f' || point == 'g')
															cropper.crop.left = Math.max(0, cropper.pointData.left + ((cropper.pointData.width - cropper.crop.width) / (point == 'f' ? 2 : 1)));
														
														// check
														if (cropper.crop.left + cropper.crop.width > cropper.$template.width()) {
															var newWidth = cropper.$template.width() - cropper.crop.left;

															cropper.crop.width = newWidth;
															cropper.crop.height = newWidth / ratioPx[2] * ratioPx[3];
														}
													}
												}
												if ((point == 'c' || point == 'd' || point == 'e') && !ratioPx) {
													cropper.crop.width = points.x - cropper.crop.left;
													if (cropper.crop.width + cropper.crop.left > cropper.$template.width())
														cropper.crop.width = cropper.$template.width() - cropper.crop.left;

													// minWidth
													if (cropper.crop.width < minWidth)
														cropper.crop.width = minWidth;
													
													// ratio
													ratioPx = ratio ? f._assets.ratioToPx(cropper.crop.width, cropper.crop.height, ratio) : null;
													if (ratioPx) {
														cropper.crop.height = ratioPx[1];
														
														if (point == 'c' || point == 'd')
															cropper.crop.top = Math.max(0, cropper.pointData.top + ((cropper.pointData.height - cropper.crop.height) / (point == 'd' ? 2 : 1)));
														
														// check
														if (cropper.crop.top + cropper.crop.height > cropper.$template.height()) {
															var newHeight = cropper.$template.height() - cropper.crop.top;
															
															cropper.crop.height = newHeight;
															cropper.crop.width = newHeight / ratioPx[3] * ratioPx[2];
														}
													}
												}
												if ((point == 'a' || point == 'g' || point == 'h') && !ratioPx) {
													cropper.crop.left = points.x;
													if (cropper.crop.left > cropper.$template.width())
														cropper.crop.left = cropper.$template.width();
													if (cropper.crop.left < 0)
														cropper.crop.left = 0;

													cropper.crop.width = lastWidth - cropper.crop.left;
													if (cropper.crop.left > cropper.crop.left + cropper.crop.width) {
														cropper.crop.left = lastWidth;
														cropper.crop.width = 0;
													}

													// minWidth
													if (cropper.crop.width < minWidth) {
														cropper.crop.left = lastWidth - minWidth;
														cropper.crop.width = minWidth;
													}
													
													// ratio
													ratioPx = ratio ? f._assets.ratioToPx(cropper.crop.width, cropper.crop.height, ratio) : null;
													if (ratioPx) {
														cropper.crop.height = ratioPx[1];
														
														if (point == 'a' || point == 'h')
															cropper.crop.top = Math.max(0, cropper.pointData.top + ((cropper.pointData.height - cropper.crop.height) / (point == 'h' ? 2 : 1)));
														
														// check
														if (cropper.crop.top + cropper.crop.height > cropper.$template.height()) {
															var newHeight = cropper.$template.height() - cropper.crop.top;
															
															cropper.crop.height = newHeight;
															cropper.crop.width = newHeight / ratioPx[3] * ratioPx[2];
															cropper.crop.left = lastWidth - cropper.crop.width;
														}
													}
												}
											}

											// draw cropping-area
											cropper.drawPlaceHolder(cropper.crop);
										},
										mouseup: function(e) {
											var cropper = item.popup.editor.cropper;

											// check if empty area
											if (cropper.$editor.width() == 0 || cropper.$editor.height() == 0)
												cropper.init(cropper.setDefaultData());

											// clear
											delete cropper.isTouchLongPress;
											delete cropper.isMoving;
											delete cropper.isResizing;
											cropper.$editor.removeClass('moving');
											$('body').css({
												'-webkit-user-select': '',
												'-moz-user-select': '',
												'-ms-user-select': '',
												'user-select': ''
											});

											// unbind window events
											$(window).off('mousemove touchmove', cropper.mousemove);
											$(window).off('mouseup touchend', cropper.mouseup);
										}
									};
									
									// init cropper tool
									item.popup.editor.cropper.init();
								} else {
									if (data)
										item.popup.editor.cropper.crop = data;
									item.popup.editor.cropper.init(data);
								}
							}	
						},
						
						/**
                         * resize
                         * resize a canvas image
                         *
						 * @namespace editor
                         * @param {DOM El} img
                         * @param {DOM El} canvas
                         * @param {Number} width - new width
                         * @param {Number} height - new height
                         * @param {Boolean} alpha - enable transparency on resize (!not available on smooth resize)
                         * @param {Boolean} fixedSize - fixed canvas size
                         * @void
                         */
						resize: function(img, canvas, width, height, alpha, fixedSize) {
							var context = canvas.getContext('2d'),
                                width = !width && height ? height * img.width / img.height : width,
                                height = !height && width ? width * img.height / img.width : height,
								widthRatio = img.width / width,
								heightRatio = img.height / height,
								optimalRatio = heightRatio < widthRatio ? heightRatio : widthRatio,
								optimalWidth = img.width / optimalRatio,
								optimalHeight = img.height / optimalRatio,
								steps = Math.ceil(Math.log(img.width / optimalWidth) / Math.log(2));

							canvas.width = optimalWidth;
							canvas.height = optimalHeight;

							// if image is smaller than canvas or there are no resizing steps
							if (img.width < canvas.width || img.height < canvas.height || steps < 2) {
								
								// set canvas size as image size if size is not fixed
								if (!fixedSize) {
									canvas.width = Math.min(img.width, canvas.width);
									canvas.height = Math.min(img.height, canvas.height);
								}
								
								// alight image to center
								var x = img.width < canvas.width ? (canvas.width - img.width)/2 : 0,
									y = img.height < canvas.height ? (canvas.height - img.height)/2 : 0;
								
								// draw image
								if (!alpha) {
									context.fillStyle = "#fff";
									context.fillRect(0, 0, canvas.width, canvas.height);
								}
								context.drawImage(img, x, y, Math.min(img.width, canvas.width), Math.min(img.height, canvas.height));
							} else {
								var oc = document.createElement('canvas'),
									octx = oc.getContext('2d'),
									factor = 2;
								
								// smooth resize
								oc.width = img.width/factor;
								oc.height = img.height/factor;
								octx.fillStyle = "#fff";
								octx.fillRect(0, 0, oc.width, oc.height);
								octx.drawImage(img, 0, 0, img.width/2, img.height/2);
								while(steps > 2) {
									var factor2 = factor + 2;
									octx.drawImage(oc, 0, 0, img.width/factor, img.height/factor, 0, 0, img.width/factor2, img.height/factor2);
									factor = factor2;
									steps--;
								}
								
								// draw image
								context.drawImage(oc, 0, 0, img.width/factor, img.height/factor, 0, 0, optimalWidth, optimalHeight);
								
								oc = octx = null;
							}
							
							context = null;
						},
						
						/**
                         * save
                         * save edited image
						 * show cropping tools, only when popup is enabled
                         *
						 * @namespace editor
                         * @param {Object} item
                         * @void
                         */
						save: function(item, toBlob, mimeType, callback, preventThumbnailRender) {
							var inPopup = item.popup && typeof item.popup.html !== "undefined";
							
							if (inPopup) {
								if (!item.popup.editor.hasChanges)
									return;
								
								var scale = item.popup.editor.scale || 1;
								
								item.editor.rotation = item.popup.editor.rotation || 0;
								if (item.popup.editor.cropper) {
									item.editor.crop = item.popup.editor.cropper.crop;
									
									item.editor.crop.width = item.editor.crop.width / item.popup.editor.cropper.crop.cfWidth / scale;
									item.editor.crop.left = item.editor.crop.left / item.popup.editor.cropper.crop.cfWidth / scale;
									item.editor.crop.height = item.editor.crop.height / item.popup.editor.cropper.crop.cfHeight / scale;
									item.editor.crop.top = item.editor.crop.top / item.popup.editor.cropper.crop.cfHeight / scale;
								}
							}
							
							// update thumbnail
							var canvas = document.createElement('canvas'),
								ctx = canvas.getContext('2d'),
								image = item.reader.node,
								rotationCf = [0, 180];
								
							// set canvas size and image
							canvas.width = image.naturalWidth;
							canvas.height = image.naturalHeight;
							ctx.drawImage(image, 0, 0);
							
							// rotate image
							if (typeof item.editor.rotation != 'undefined') {
								canvas.width = rotationCf.indexOf(item.editor.rotation) > -1 ? image.naturalWidth : image.naturalHeight;
								canvas.height = rotationCf.indexOf(item.editor.rotation) > -1 ? image.naturalHeight : image.naturalWidth;
								
								var angle = item.editor.rotation*Math.PI/180,
									cw = canvas.width * 0.5,
									ch = canvas.height * 0.5;
								
								// clear context
								ctx.clearRect(0, 0, canvas.width, canvas.height);
								
								// rotate context
								ctx.translate(cw, ch);
								ctx.rotate(angle);
								ctx.translate(-image.naturalWidth * 0.5, -image.naturalHeight * 0.5);

								// draw image and reset transform
								ctx.drawImage(image, 0, 0);
								ctx.setTransform(1, 0, 0, 1, 0, 0);
							}
							
							// crop image
							if (item.editor.crop) {
								var cut = ctx.getImageData(item.editor.crop.left, item.editor.crop.top, item.editor.crop.width, item.editor.crop.height);
								
								canvas.width = item.editor.crop.width;
								canvas.height = item.editor.crop.height;
								
								// put image
								ctx.putImageData(cut, 0, 0);
							}
							
							// export image
							var type = mimeType || item.type || 'image/jpeg',
								quality = n.editor.quality || 90,
								exportDataURI = canvas.toDataURL(type, quality/100),
								nextStep = function(exportDataURI, img) {
									var data = !toBlob ? exportDataURI : f._assets.dataURItoBlob(exportDataURI, type);
									
									inPopup && !preventThumbnailRender ? f.thumbnails.renderThumbnail(item, true, img || exportDataURI) : null;
									callback ? callback(data, item, l, p, o, s) : null;
									n.editor.onSave != null && typeof n.editor.onSave == "function" ? n.editor.onSave(data, item, l, p, o, s) : null;
									f.set('listInput', null);
								};
							
							// resize image if maxWidth
							if (n.editor.maxWidth || n.editor.maxHeight) {
								var img = new Image();
								
								img.src = exportDataURI;
								img.onload = function() {
									var canvas2 = document.createElement('canvas');
									
									// resize canvas
									f.editor.resize(img, canvas2, n.editor.maxWidth, n.editor.maxHeight, true, false);
									
									exportDataURI = canvas2.toDataURL(type, quality/100);
									canvas = ctx = canvas2 = null;
									nextStep(exportDataURI, img);
								};
							} else {
								canvas = ctx = null;
								nextStep(exportDataURI);
							}
						}
					},
					
					/**
                     * @namespace sorter
                     */
					sorter: {
						init: function() {
							p.on('mousedown touchstart', n.thumbnails._selectors.sorter, f.sorter.mousedown);
						},
						destroy: function() {
							p.off('mousedown touchstart', n.thumbnails._selectors.sorter, f.sorter.mousedown);
						},
						prevent: function(e) {
							if (e === true)
								return 'click drop dragend dragleave dragover dragenter dragstart touchstart touchmove touchend touchcancel';
							
							e.preventDefault();
						},
						mousedown: function(e) {
							var eventType = e.originalEvent.touches && e.originalEvent.touches[0] ? 'touchstart' : 'mousedown',
								$target = $(e.target),
								$item = $target.closest(n.thumbnails._selectors.item),
								item = f.files.find($item),
								points = {
									x: eventType == 'mousedown' || !$item.length ? e.pageX : e.originalEvent.touches[0].pageX,
									y: eventType == 'mousedown' || !$item.length ? e.pageY : e.originalEvent.touches[0].pageY
								},
								callback = function() {
									// set current state
									f.sorter.sort = {
										el: $target,
										item: item,
										items: l.find(n.thumbnails._selectors.item),
										x: points.x,
										y: points.y,
										xItem: points.x - $item.offset().left,
										yItem: points.y - $item.offset().top,
										left: $item.position().left,
										top: $item.position().top,
										width: $item.outerWidth(),
										height: $item.outerHeight(),
										placeholder: n.sorter.placeholder ? $(n.sorter.placeholder) : item.html.clone().addClass('fileuploader-sorter-placeholder').html('')
									};
									
									// disable user-select
									$('body').css({
										'-webkit-user-select': 'none',
										'-moz-user-select': 'none',
										'-ms-user-select': 'none',
										'user-select': 'none'
									});

									// bind window mousemove event
									$(window).on('mousemove touchmove', f.sorter.mousemove);
								};
                            
                            // off
                            if (f.sorter.sort)
                                f.sorter.mouseup();
							
							// prevent if there is no item
							if (!item)
								return;
							
							// prevent if target is selectorExclude
							if (n.sorter.selectorExclude && ($target.is(n.sorter.selectorExclude) || $target.closest(n.sorter.selectorExclude).length))
								return;
							
							// preventDefault();
							p.on(f.sorter.prevent(true), n.thumbnails._selectors.sorter, f.sorter.prevent);

							// mousedown event
							if (eventType == 'mousedown') {
								// bind cropping start event
								callback();
							}

							// touchstart event
							if (eventType == 'touchstart') {
								f.sorter.isTouchLongPress = true;

								// check if long press
								setTimeout(function() {
									if (!f.sorter.isTouchLongPress)
										return;
									
									delete f.sorter.isTouchLongPress;
									callback();
								}, 500);
							}

							// bind window mouseup event
							$(window).on('mouseup touchend', f.sorter.mouseup);
						},
						findItemAtPos: function(points) {
							var sort = f.sorter.sort,
								$list = sort.items.not(sort.item.html),
								$item = null;
							
							$list.each(function(i, el) {
								var $el = $(el);
								
								if (points.x > $el.offset().left && points.x < $el.offset().left + $el.outerWidth() &&
								  points.y > $el.offset().top && points.y < $el.offset().top + $el.outerHeight()) {
									$item = $el;
									return false;
								}
							});
							
							return $item;
						},
						mousemove: function(e) {
							var eventType = e.originalEvent.touches && e.originalEvent.touches[0] ? 'touchstart' : 'mousedown',
								sort = f.sorter.sort,
								item = sort.item,
                                $list = l.find(n.thumbnails._selectors.item),
								$container = $(n.sorter.scrollContainer || window),
                                scroll = {
                                    left: $container.scrollLeft(),
                                    top: $container.scrollTop()
                                },
								points = {
									x: eventType == 'mousedown' ? e.pageX : e.originalEvent.touches[0].pageX,
									y: eventType == 'mousedown' ? e.pageY : e.originalEvent.touches[0].pageY
								};

							// drag
							var left = points.x - sort.xItem - scroll.left,
								top = points.y - sort.yItem - scroll.top;

							// position
							if (left + sort.xItem > $container.width())
								left = $container.width() - sort.xItem;
							if (left < 0 - sort.xItem)
								left = 0 - sort.xItem;
							if (top + sort.yItem  > $container.height())
								top = $container.height() - sort.yItem;
							if (top < 0 - sort.yItem)
								top = 0 - sort.yItem;
                            
							// set style
							item.html.addClass('sorting').css({
                                position: 'fixed',
								left: left,
								top: top,
								width: f.sorter.sort.width,
								height: f.sorter.sort.height
							});
							
							// position placeholder
							if (!l.find(sort.placeholder).length)
								item.html.after(sort.placeholder);
							sort.placeholder.css({
								width: f.sorter.sort.width,
								height: f.sorter.sort.height,
							});
                            
							// set new position
							var $hoverEl = f.sorter.findItemAtPos({x: left + sort.xItem + scroll.left, y: top + sort.yItem + scroll.top});
							if ($hoverEl) {
                                // prevent drag issue
                                var directionX = sort.placeholder.offset().left != $hoverEl.offset().left,
                                    directionY = sort.placeholder.offset().top != $hoverEl.offset().top;
								if (f.sorter.sort.lastHover) {
									if (f.sorter.sort.lastHover.el == $hoverEl[0]) {
										if (directionY && f.sorter.sort.lastHover.direction == 'before' && points.y < f.sorter.sort.lastHover.y)
											return;
										if (directionY && f.sorter.sort.lastHover.direction == 'after' && points.y > f.sorter.sort.lastHover.y)
											return;
                                        
                                        if (directionX && f.sorter.sort.lastHover.direction == 'before' && points.x < f.sorter.sort.lastHover.x)
											return;
										if (directionX && f.sorter.sort.lastHover.direction == 'after' && points.x > f.sorter.sort.lastHover.x)
											return;
									}
								}
								
                                // insert element before/after in HTML
								var index = $list.index(item.html),
									hoverIndex = $list.index($hoverEl),
                                    direction = index > hoverIndex ? 'before' : 'after';
								
								$hoverEl[direction](sort.placeholder);
								$hoverEl[direction](item.html);
                                
                                // save last hover data
								f.sorter.sort.lastHover = {
									el: $hoverEl[0],
									x: points.x,
									y: points.y,
									direction: direction
								};
                                
                                // reset container scroller
                                $container.scrollLeft(scroll.left);
                                $container.scrollTop(scroll.top);
							}
						},
						mouseup: function() {
							var sort = f.sorter.sort,
								item = sort.item;
							
							// clear
							$('body').css({
								'-webkit-user-select': '',
								'-moz-user-select': '',
								'-ms-user-select': '',
								'user-select': ''
							});
                            
                            item.html.removeClass('sorting').css({
                                position: '',
                                left: '',
                                top: '',
                                width: '',
                                height: ''
                            });
                            sort.placeholder.remove();
                            delete f.sorter.sort;
							
                            p.off(f.sorter.prevent(true), n.thumbnails._selectors.sorter, f.sorter.prevent);
							$(window).off('mousemove touchmove', f.sorter.mousemove);
							$(window).off('mouseup touchend', f.sorter.mouseup);
							
							f.sorter.save();
						},
						save: function(isFromList) {
							var index = 0,
								list = [],
								hasChanges = f.rendered && isFromList;
							
							// set index for all files
							// if not rendered - from the _itFl; if rendered - from HTML
							$.each(isFromList ? f._itFl : l.children(), function(i, el) {
								var item = el.file ? el : f.files.find($(el));
								
								if (item) {
                                    // inspired from files.list method
                                    if (item.upload && !item.uploaded) {
                                        hasChanges = false;
                                        return false;
                                    }
                                    
                                    // check if changes
									if (f.rendered && item.index != index)
										hasChanges = true;
									
									item.index = index;
									list.push(item);
									index++;
								}
							});
							
							// replace list 
							if (hasChanges && list.length == f._itFl.length)
								f._itFl = list;
							
							// update listInput
							if (!isFromList)
								f.set('listInput', 'ignoreSorter');
							
							// onSort callback
							hasChanges && n.sorter.onSort != null && typeof n.sorter.onSort == "function" ? n.sorter.onSort(list, l, p, o, s) : null;
						}
					},
                    
                    /**
                     * @namespace upload
                     */
                    upload: {
						/**
                         * prepare
                         * prepare item ajax data and also item ajax methods
                         *
						 * @namespace upload
                         * @param {Object} item
						 * @param {bool} force_send - force ajax sending after prepare
                         * @void
                         */
                        prepare: function(item, force_send) {
							// create item upload object
                            item.upload = {
                                url: n.upload.url,
                                data: n.upload.data || {},
                                formData: new FormData(),
                                type: n.upload.type || 'POST',
                                enctype: n.upload.enctype || 'multipart/form-data',
                                cache: false,
                                contentType: false,
                                processData: false,
                                
								status: null,
                                send: function() {
                                    f.upload.send(item, true);
                                },
                                cancel: function() {
                                    f.upload.cancel(item);
                                },
                                retry: function() {
                                    f.upload.retry(item);
                                }
                            };
                            
                            // add file to formData
                            item.upload.formData.append(s.attr('name'), item.file, (item.name ? item.name : false));
                            
                            if (n.upload.start || force_send)
                                f.upload.send(item, force_send);
                        },
						/**
                         * send
                         * send item ajax
                         *
						 * @namespace upload
                         * @param {Object} item
						 * @param {bool} force_send - skip the synchron functions and force ajax sending
                         * @void
                         */
                        send: function(item, force_send) {
                            // skip if upload settings were not prepared
							// only made for safety
                            if (!item.upload)
                                return;
							
							var setItemUploadStatus = function(status) {
									item.html.removeClass('upload-pending upload-loading upload-cancelled upload-failed upload-success').addClass('upload-' + (status || item.upload.status));
								},
								loadNextItem = function() {
									var i = 0;
									
									if (f._pfuL.length > 0) {
										f._pfuL.indexOf(item) > -1 ? f._pfuL.splice(f._pfuL.indexOf(item), 1) : null;
										while (i < f._pfuL.length) {
											if (f._itFl.indexOf(f._pfuL[i]) > -1 && f._pfuL[i].upload && !f._pfuL[i].upload.$ajax) {
												f.upload.send(f._pfuL[i], true);
												break;
											} else {
												f._pfuL.splice(i, 1);
											}
											i++;
										}
									}
								};
                            
                            if (n.upload.synchron) {
								// add pending status to item
								item.upload.status = 'pending';
								if (item.html)
									setItemUploadStatus();
								
                            	// check pending list
								if (force_send) {
									f._pfuL.indexOf(item) > -1 ? f._pfuL.splice(f._pfuL.indexOf(item), 1) : null;
								} else {
									f._pfuL.indexOf(item) == -1 ? f._pfuL.push(item) : null;
									if (f._pfuL.length > 1) {
										return;
									}
								}
                            }
                            
                            // upload.beforeSend callback
							if (n.upload.beforeSend && $.isFunction(n.upload.beforeSend) && n.upload.beforeSend(item, l, p, o, s) === false) {
								setItemUploadStatus();
								loadNextItem();
								return;
							}
                            
							// add uploading class to parent element
							p.addClass('fileuploader-is-uploading');
							
                            // add loading status to item
							if (item.upload.$ajax)
								item.upload.$ajax.abort();
							delete item.upload.$ajax;
                            delete item.upload.send;
							item.upload.status = 'loading';
                            if (item.html) {
								if (n.thumbnails._selectors.start)
                                    item.html.find(n.thumbnails._selectors.start).remove();
                                setItemUploadStatus();
							}
                            
                            // add upload data to formData
                            if (item.upload.data) {
                                for (var k in item.upload.data) {
                                    item.upload.formData.append(k, item.upload.data[k]);
                                }
                            }
                            
                            item.upload.data = item.upload.formData;
                            item.upload.xhr = function() {
                                var xhr = $.ajaxSettings.xhr(),
                                    xhrStartedAt = new Date();

                                if (xhr.upload) {
                                    xhr.upload.addEventListener("progress", function(e) {
										if (item.upload.$ajax) {
											item.upload.$ajax.total = e.total;
											item.upload.$ajax.xhrStartedAt = xhrStartedAt;
										}
                                        f.upload.progressHandling(e, item, xhrStartedAt);
                                    }, false);
                                }
                                return xhr;
                            };
                            item.upload.complete = function(jqXHR, textStatus) {
                                loadNextItem();
                                
                                var g = true;
                                $.each(f._itFl, function(i, a) {
                                    if (a.upload && a.upload.$ajax)
                                        g = false;
                                });
                                if (g) {
                                    p.removeClass('fileuploader-is-uploading');
                                    n.upload.onComplete != null && typeof n.upload.onComplete == "function" ? n.upload.onComplete(l, p, o, s, jqXHR, textStatus) : null;
                                }
                            };
                            item.upload.success = function(data, textStatus, jqXHR) {
								f.upload.progressHandling(null, item, item.upload.$ajax.xhrStartedAt, true);
                                item.uploaded = true;
                                delete item.upload;
								item.upload = {status: 'successful', resend: function() { f.upload.retry(item); }};
                                
                                if (item.html)
                                    setItemUploadStatus();
								
                                n.upload.onSuccess != null && $.isFunction(n.upload.onSuccess) ? n.upload.onSuccess(data, item, l, p, o, s, textStatus, jqXHR) : null;
                                f.set('listInput', null);
                            };
                            item.upload.error = function(jqXHR, textStatus, errorThrown) {
                                item.uploaded = false;
								item.upload.status = item.upload.status == 'cancelled' ? item.upload.status : 'failed';
                                delete item.upload.$ajax;
                                
                                if (item.html)
                                    setItemUploadStatus();
								
                                n.upload.onError != null && $.isFunction(n.upload.onError) ? n.upload.onError(item, l, p, o, s, jqXHR, textStatus, errorThrown) : null;
                            };
                            
                            // send
                            item.upload.$ajax = $.ajax(item.upload);
                        },
						/**
                         * cancel
                         * cancel item ajax request
                         *
						 * @namespace upload
                         * @param {Object} item
                         * @void
                         */
                        cancel: function(item) {
                            if (item && item.upload) {
                                item.upload.status = 'cancelled';
                                item.upload.$ajax ? item.upload.$ajax.abort() : null;
								delete item.upload.$ajax;
                                f.files.remove(item);
                            }
                        },
						/**
                         * retry
                         * retry item ajax upload
                         *
						 * @namespace upload
                         * @param {Object} item
                         * @void
                         */
                        retry: function(item) { 
                            if (item && item.upload) {
                                if (item.html && n.thumbnails._selectors.retry)
                                    item.html.find(n.thumbnails._selectors.retry).remove();
								
                                f.upload.prepare(item, true);
                            }
                        },
						/**
                         * progressHandling
                         * item ajax progress function
                         *
						 * @namespace upload
                         * @param {Event} e - xhr event
						 * @param {Object} item
						 * @param {Date} xhrStartedAt - request started Date()
						 * @param {Boolean} isManual - check if function was manually called
                         * @void
                         */
                        progressHandling: function(e, item, xhrStartedAt, isManual) {
							if (!e && isManual && item.upload.$ajax)
								e = {total: item.upload.$ajax.total, loaded: item.upload.$ajax.total, lengthComputable: true};
							
                            if (e.lengthComputable) {
                                var loaded = e.loaded,
                                    total = e.total,
                                    percentage = Math.round(loaded * 100 / total),
                                    secondsElapsed = (new Date().getTime() - xhrStartedAt.getTime()) / 1000,
                                    bytesPerSecond = secondsElapsed ? loaded / secondsElapsed : 0,
                                    remainingBytes = total - loaded,
                                    secondsRemaining = secondsElapsed ? remainingBytes / bytesPerSecond : null,
                                    data = {
                                        loaded: loaded,
                                        loadedInFormat: f._assets.bytesToText(loaded),
                                        total: total,
                                        totalInFormat: f._assets.bytesToText(total),
                                        percentage: percentage,
                                        secondsElapsed: secondsElapsed,
                                        secondsElapsedInFormat: f._assets.secondsToText(secondsElapsed, true),
                                        bytesPerSecond: bytesPerSecond,
                                        bytesPerSecondInFormat: f._assets.bytesToText(bytesPerSecond) + '/s',
                                        remainingBytes: remainingBytes,
                                        remainingBytesInFormat: f._assets.bytesToText(remainingBytes),
                                        secondsRemaining: secondsRemaining,
                                        secondsRemainingInFormat: f._assets.secondsToText(secondsRemaining, true)
                                    };
                                
								if (data.percentage > 99 && !isManual)
									data.percentage = 99;
								
								// upload.onProgress callback
                                n.upload.onProgress && $.isFunction(n.upload.onProgress) ? n.upload.onProgress(data, item, l, p, o, s) : null;
                            }
                        }
                    },
					
                    /**
                     * @namespace dragDrop
                     */
					dragDrop: {
						/**
                         * onDragEnter
                         * on dragging file on the drag container
                         *
						 * @namespace dragDrop
                         * @param {Event} e - jQuery event
                         * @void
                         */
						onDragEnter: function(e) {
                            clearTimeout(f.dragDrop._timer);
                            
							// add dragging class to parent element
                            n.dragDrop.container.addClass('fileuploader-dragging');
							
							// set feedback caption
                            f.set('feedback', f._assets.textParse(n.captions.drop));
                            
							// dragDrop.onDragEnter callback
                            n.dragDrop.onDragEnter != null && $.isFunction(n.dragDrop.onDragEnter) ? n.dragDrop.onDragEnter(e, l, p, o, s) : null;
                        },
						/**
                         * onDragLeave
                         * on dragging leave from the drag container
                         *
						 * @namespace dragDrop
                         * @param {Event} e - jQuery event
                         * @void
                         */
                        onDragLeave: function(e) {
                            clearTimeout(f.dragDrop._timer);
                            
                            f.dragDrop._timer = setTimeout(function(e) {
								// check if not the childNodes from dragging container are hovered
                                if (!f.dragDrop._dragLeaveCheck(e)) {
                                    return false;
                                }
								
								// remove dragging class from parent element
                                n.dragDrop.container.removeClass('fileuploader-dragging');
                                
								// set feedback caption
								f.set('feedback', null);
                                
								// dragDrop.onDragLeave callback
                                n.dragDrop.onDragLeave != null && $.isFunction(n.dragDrop.onDragLeave) ? n.dragDrop.onDragLeave(e, l, p, o, s) : null;
                            }, 100, e);
                        },
						/**
                         * onDrop
                         * on drop files
                         *
						 * @namespace dragDrop
                         * @param {Event} e - jQuery event
                         * @void
                         */
                        onDrop: function(e) {
                            clearTimeout(f.dragDrop._timer);
                            
							// remove dragging class from parent element
                            n.dragDrop.container.removeClass('fileuploader-dragging');
                            
							// set feedback caption 
							f.set('feedback', null);
							
							// check if event has dropped files and use them
                            if (e && e.originalEvent && e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files && e.originalEvent.dataTransfer.files.length) {
								if (f.isUploadMode()) {
				                	f.onChange(e, e.originalEvent.dataTransfer.files);
								} else {
									s.prop('files', e.originalEvent.dataTransfer.files);
								}
                            }
                            
							// dragDrop.onDrop callback
                            n.dragDrop.onDrop != null && $.isFunction(n.dragDrop.onDrop) ? n.dragDrop.onDrop(e, l, p, o, s) : null;
                        },
						/**
                         * _dragLeaveCheck
                         * check by the living from drag container if not the childNodes are hovered
                         *
						 * @namespace dragDrop
                         * @param {Event} e - jQuery event
                         * @return {bool} return the leaving statement
                         */
                        _dragLeaveCheck: function(e) {
                            var related = $(e.currentTarget),
                                insideEls;
							
                            if (!related.is(n.dragDrop.container)) {
                                insideEls = n.dragDrop.container.find(related);

                                if (insideEls.length) {
                                    return false;
                                }
                            }
							
                            return true;
                        }
					},
                    
                    /**
                     * @namespace clipboard
                     */
                    clipboard: {
						/**
                         * paste
                         * on pasting a file from clipboard on page
                         *
						 * @namespace clipboard
                         * @param {Event} e - jQuery event
                         * @void
                         */
                        paste: function(e) {
                            // check if the input is into view and if clipboard is supported and if there are files in the clipboard
                            if (!f._assets.isIntoView(o) || !e.originalEvent.clipboardData || !e.originalEvent.clipboardData.items || !e.originalEvent.clipboardData.items.length)
                                return;
                            
                            var items =  e.originalEvent.clipboardData.items;
							
							// extra clean
							f.clipboard.clean();
							
							for (var i = 0; i < items.length; i++) {
								if (items[i].type.indexOf("image") !== -1 || items[i].type.indexOf("text/uri-list") !== -1) {
									var blob = items[i].getAsFile(),
										date = new Date(),
										addZero = function(x) {
											if (x < 10)
												x = "0" + x;
											
											return x;
										},
										ms = n.clipboardPaste > 1 ? n.clipboardPaste : 2000;
									
									if (blob) {
										// create clipboard file name
										blob._name = 'Clipboard ' + date.getFullYear() + '-' + addZero(date.getMonth()+1) + '-' + addZero(date.getDate()) + ' ' + addZero(date.getHours()) + '-' + addZero(date.getMinutes()) + '-' + addZero(date.getSeconds());
										blob._name += blob.type.indexOf("/") != -1 ? "." + blob.type.split("/")[1].toString().toLowerCase() : ".png";

										// set clipboard timer
										f.set('feedback', f._assets.textParse(n.captions.paste, {ms: ms/1000}));
										f.clipboard._timer = setTimeout(function() {
											f.set('feedback', null);
											f.onChange(e, [blob]);
										}, ms-2);
									}
								}
							}
                        },
						/**
                         * clean
                         * clean the clipboard timer
                         *
						 * @namespace clipboard
                         * @void
                         */
                        clean: function() {
                            if (f.clipboard._timer) {
                                clearTimeout(f.clipboard._timer);
								delete f.clipboard._timer;
								
								// set feedback caption
                                f.set('feedback', null);
                            }
                        }
                    },
                    
                    /**
                     * @namespace files
                     */
					files: {
						/**
                         * add
                         * add a file to memory
                         *
						 * @namespace files
                         * @param {Object} file
						 * @param {String} prop - type of adding a file to memory
                         * @return {Number} index - index of the item in memory array
                         */
						add: function(file, prop) {
							var name = file._name || file.name,
								size = file.size,
								size2 = f._assets.bytesToText(size),
								type = file.type,
								format = type ? type.split('/', 1).toString().toLowerCase() : '',
								extension = name.indexOf('.') != -1 ? name.split('.').pop().toLowerCase() : '',
								title = name.substr(0, name.length - (name.indexOf('.') != -1 ? extension.length+1 : extension.length)),
								data = file.data || {},
								file = file.file || file,
								id = Date.now(),
								index,
								item;
                            
							f._itFl.push({
								name: name,
								title: title,
								size: size,
								size2: size2,
								type: type,
								format: format,
								extension: extension,
								data: data,
								file: file,
                                reader: {
                                    read: function(callback, type, force) { return f.files.read(item, callback, type, force); }
                                },
								id: id,
								
								input: prop == 'choosed' ? s : null,
								html: null,
								choosed: prop == 'choosed',
								appended: prop == 'appended',
								uploaded: prop == 'uploaded'
							});
							
							index = f._itFl.length - 1;
							item = f._itFl[index];
							item.remove = function() {
								f.files.remove(item);
							};
							
							if (n.editor && format == 'image')
								item.editor = {
									rotate: function(deg) {
										f.editor.rotate(item, deg);
									},
									cropper: function(data) {
										f.editor.crop(item, data);
									},
									save: function(callback, toBlob, mimeType, preventThumbnailRender) {
										f.editor.save(item, toBlob, mimeType, callback, preventThumbnailRender);
									}
								};
							
							return index;
						},
                        /**
                         * read
                         * read choosed file and sends the information to callback
                         *
						 * @namespace files
                         * @param {Object} item
                         * @param {Function} callback
                         * @param {String} type - FileReader readAs type
                         * @param {Boolean} force - force a new file read and ignore the existing
                         * @return {null}
                         */
                        read: function(item, callback, type, force) {
                            if (f.isFileReaderSupported()) {
                                var reader = new FileReader(),
                                    useFile = item.choosed,
                                    execute_callbacks = function() {
                                        var _callbacks = item.reader._callbacks;
                                        
                                        delete item.reader._callbacks;
                                        delete item.reader._FileReader;
                                        
                                        for(var i = 0; i<_callbacks.length; i++) {
                                            $.isFunction(_callbacks[i]) ? _callbacks[i](item, l, p, o, s) : null;
                                        }
                                        
                                        n.onFileRead && $.isFunction(n.onFileRead) ? n.onFileRead(item, l, p, o, s) : null;
                                    };
                                
                                if ((!item.reader.src && !item.reader._FileReader) || force)
                                    item.reader = {
                                        _FileReader: reader,
                                        _callbacks: [],
                                        read: item.reader.read
                                    };
                                
                                if (item.reader.src && !force)
                                    return callback && $.isFunction(callback) ? callback(item, l, p, o, s) : null;
                                
                                if (callback && item.reader._callbacks) {
                                    item.reader._callbacks.push(callback);
                                    
                                    if (item.reader._callbacks.length > 1)
                                        return;
                                }
                                
								if (item.format == 'astext') {
									reader.onload = function(e) {
										var node = document.createElement('div');
										
										item.reader.node = node;
          								item.reader.src = e.target.result;
										item.reader.length = e.target.result.length;
										
										node.innerHTML = item.reader.src.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
										
										execute_callbacks();
									};
									reader.onerror = function() {
										execute_callbacks();
                                        item.reader = { read: item.reader.read };
									};
									if (useFile)
                                        reader.readAsText(item.file);
                                    else
                                        $.ajax({
											url : item.file,
											success : function(result){
												reader.onload({target: {result: result}});
											},
											error: function() {
												reader.onerror();
											}
										});
								} else if (item.format == 'image') {
                                    reader.onload = function(e) {
                                        var node = new Image();
                                        
										if (item.data && item.data.readerCrossOrigin)
											node.setAttribute('crossOrigin', item.data.readerCrossOrigin);
                                        node.src = e.target.result + (force && !useFile ? (e.target.result.indexOf('?') == -1 ? '?' : '&') + 'd=' + Date.now() : '');
                                        node.onload = function() {
                                            item.reader.node = node;
                                            item.reader.src = node.src;
                                            item.reader.width = node.width;
                                            item.reader.height = node.height;
                                            item.reader.ratio = f._assets.pxToRatio(item.reader.width, item.reader.height);
                                            
                                            execute_callbacks();
                                        };
                                        node.onerror = function() {
                                            execute_callbacks();
                                            item.reader = { read: item.reader.read };
                                        };
                                    };
                                    reader.onerror = function() {
                                        execute_callbacks();
                                        item.reader = { read: item.reader.read };
                                    };
                                    
                                    if (useFile)
                                        reader.readAsDataURL(item.file);
                                    else
                                        reader.onload({target: {result: item.file}});
                                } else if (item.format == 'video' || item.format == 'audio') {
                                    var node = document.createElement(item.format),
                                        canPlay = node.canPlayType(item.type),
                                        src;
                                    
                                    if (URL && canPlay !== '') {
                                        src = useFile ? URL.createObjectURL(item.file) : item.file;
                                        node.onloadedmetadata = function() {
                                            item.reader.node = node;
                                            item.reader.src = node.src;
                                            item.reader.duration = node.duration;
                                            item.reader.duration2 = f._assets.secondsToText(node.duration);
                                            
                                            if (item.format == 'video') {
                                                item.reader.width = node.videoWidth;
                                                item.reader.height = node.videoHeight;
												item.reader.ratio = f._assets.pxToRatio(item.reader.width, item.reader.height);
                                            }
                                        };
                                        node.onerror = function() {
                                            execute_callbacks();
                                            item.reader = { read: item.reader.read };
                                        };
                                        node.onloadeddata = function() {
                                            if (item.format == 'video') {
                                                var canvas = document.createElement('canvas'),
                                                    context = canvas.getContext('2d');

                                                canvas.width = node.videoWidth;
                                                canvas.height = node.videoHeight;
                                                context.drawImage(node, 0, 0, canvas.width, canvas.height);
                                                item.reader.frame = !f._assets.isBlankCanvas(canvas) ? canvas.toDataURL() : null;

                                                canvas = context = null;
                                            }
                                            
                                            execute_callbacks();
                                        };
                                        
										// dirty fix
                                        setTimeout(function() {
                                            node.src = src;
                                        }, 100);
                                    } else {
                                        execute_callbacks();
                                        item.reader = { read: item.reader.read };
                                    }
                                } else {
                                    reader.onload = function(e) {
                                        item.reader.src = e.target.result;
                                        item.reader.length = e.target.result.length;
                                        
                                        execute_callbacks();
                                    };
									reader.onerror = function(e) {
										execute_callbacks();
										item.reader = { read: item.reader.read };
									};
                                    useFile ? reader[type || 'readAsBinaryString'](item.file) : execute_callbacks();
                                }
                            } else {
                                if (callback)
                                    callback(item, l, p, o, s);
                            }
                            
                            return null;
                        },
						/**
                         * list
                         * generate a list of files
                         *
						 * @namespace files
                         * @param {bool} toJSON - generate a JSON list
						 * @param {String} customKey - use a custom item attribute by generating
						 * @param {Boolean} triggered - function was triggered from the API
						 * @param {String} additional - additional settings
                         * @return {String|Object}
                         */
						list: function(toJson, customKey, triggered, additional) {
							var files = [];
							
							// save sorter
							if (n.sorter && !triggered && (!additional || additional != 'ignoreSorter'))
								f.sorter.save(true);
							
							$.each(f._itFl, function(i, a) {
								if (a.upload && !a.uploaded)
									return true;
								
								var file = a;
								
								if (customKey || toJson)
									file = (file.choosed ? '0:/' : '') + (customKey && f.files.getItemAttr(a, customKey) !== null ? f.files.getItemAttr(a, customKey) : a[typeof a.file == "string" ? "file" : "name"]);
								
								if (toJson) {
									file = {file: file};
									
									// editor properties
									// add only if file was cropped or rotated
									if (a.editor && (a.editor.crop || a.editor.rotation)) {
										file.editor = {};
										if (a.editor.rotation)
											file.editor.rotation = a.editor.rotation;
										if (a.editor.crop)
											file.editor.crop = a.editor.crop;
									}
									
									// sorting property
									if (typeof a.index !== 'undefined') {
										file.index = a.index;
									}
									
									// custom properties
									if (a.data && a.data.listProps) {
										for (var key in a.data.listProps) {
											file[key] = a.data.listProps[key];
										}
									}
								}
								
								files.push(file);
							});
                            
                            files = n.onListInput && $.isFunction(n.onListInput)? n.onListInput(files, f._itFl, n.listInput, l, p, o, s) : files;
							
							return !toJson ? files : JSON.stringify(files);
						},
						/**
                         * check
                         * check the files
                         *
						 * @namespace files
                         * @param {Object} item
						 * @param {Array} files
						 * @param {bool} fullCheck - check some parameters that should be checked only once
                         * @return {bool|Array} r
                         */
						check: function(item, files, fullCheck) {
							var r = ["warning", null, false, false];
							
							if (n.limit != null && fullCheck && files.length + f._itFl.length - 1 > n.limit) {
                                r[1] = f._assets.textParse(n.captions.errors.filesLimit);
                                r[3] = true;
                                return r;
							}
							if (n.maxSize != null && fullCheck) {
								var g = 0;
								$.each(f._itFl, function(i, a) {
                                    g += a.size;
								}); g -= item.size;
								$.each(files, function(i, a) {
									g += a.size;
								});

								if (g > Math.round(n.maxSize * 1e+6)) {
                                    r[1] = f._assets.textParse(n.captions.errors.filesSizeAll);
                                    r[3] = true;
                                    return r;
								}
							}
                            if (n.onFilesCheck != null && $.isFunction(n.onFilesCheck) && fullCheck) {
								var onFilesCheck = n.onFilesCheck(files, n, l, p, o, s);
								if (onFilesCheck === false) {
                                    r[3] = true;
									return r;
								}
							}
							if (n.extensions != null && $.inArray(item.extension, n.extensions) == -1 && $.inArray(item.type, n.extensions) == -1) {
								r[1] = f._assets.textParse(n.captions.errors.filesType, item);
								return r;
							}
							if (n.fileMaxSize != null && item.size > n.fileMaxSize * 1e+6) {
								r[1] = f._assets.textParse(n.captions.errors.fileSize, item);
								return r;
							}
							if (item.size == 4096 && item.type == "") {
								r[1] = f._assets.textParse(n.captions.errors.folderUpload, item);
								return r;
							}
							if (!n.skipFileNameCheck) {
								var g = false;
                                
								$.each(f._itFl, function(i, a) {
							  		if (a != item && a.choosed == true && a.file && a.name == item.name) {
										g = true;
                                        
                                        if (a.file.size == item.size && a.file.type == item.type && (item.file.lastModified && a.file.lastModified ? a.file.lastModified == item.file.lastModified : true) && files.length > 1) {
                                            r[2] = true;
                                        } else {
                                            r[1] = f._assets.textParse(n.captions.errors.fileName, item);
                                            r[2] = false;
                                        }
                                        
										return false;
									}
								});
								
								if (g) {
									return r;
								}
							}
							
							return true;
						},
						/**
                         * append
                         * check the files
                         *
						 * @namespace files
                         * @param {Array} files
                         * @return {bool|Object}
                         */
						append: function(files) {
							files = $.isArray(files) ? files : [files];
							
							if (files.length) {
								var item;
								for (var i = 0; i < files.length; i++) {
									item =  f._itFl[f.files.add(files[i], 'appended')];
									
									n.thumbnails ? f.thumbnails.item(item) : null;
								}
								
								// set feedback caption
								f.set('feedback', null);
								
								// set listInput value
								f.set('listInput', null);
								
								// afterSelect callback
								n.afterSelect && $.isFunction(n.afterSelect) ? n.afterSelect(l, p, o, s) : null;
								
								return files.length == 1 ? item : true;
							}
						},
						/**
                         * find
                         * find an item in memory using html element
                         *
						 * @namespace files
                         * @param {jQuery Object} html
                         * @return {null,Object}
                         */
                        find: function(html) {
                            var item = null;
                            
                            $.each(f._itFl, function(i, a) {
                                if (a.html && a.html.is(html)) {
                                    item = a;
                                    return false;
                                }
                            });
                            
                            return item;
                        },
						/**
                         * remove
                         * remove an item from memory and html
                         *
						 * @namespace files
                         * @param {Object} item
                         * @param {bool} isFromCheck - if removing function was triggered by checking a file
                         * @return {null,Object}
                         */
						remove: function(item, isFromCheck) {
							// onRemove callback
							if (!isFromCheck && n.onRemove && $.isFunction(n.onRemove) && n.onRemove(item, l, p, o, s) === false)
								return;
							
							// thumbnails.onItemRemove callback
                            if (item.html)
                                n.thumbnails.onItemRemove && $.isFunction(n.thumbnails.onItemRemove) && !isFromCheck ? n.thumbnails.onItemRemove(item.html, l, p, o, s) : item.html.remove();
							
							// cancel file upload
							if (item.upload && item.upload.$ajax && item.upload.cancel)
								item.upload.cancel();
							
							// remove popup
							if (item.popup && item.popup.html)
								item.popup.html.remove();
                            
                            // remove filereader
                            if (item.reader.src) {
                                item.reader.node = null;
                                URL.revokeObjectURL(item.reader.src);
                            }
							
							// check if any file is in the same input like item.input
							if (item.input) {
								var g = true;
								$.each(f._itFl, function(i, a) {
									if (item != a && (item.input == a.input || (isFromCheck && item.input.get(0).files.length > 1))) {
										g = false;
										return false;
									}
								});
								if (g) {
									if (f.isAddMoreMode() && sl.length > 1) {
										f.set('nextInput');
										sl.splice(sl.indexOf(item.input), 1);
										item.input.remove();
									} else {
										f.set('input', '');
									}
								}
							}
                            
							// remove data from memory
                            f._pfrL.indexOf(item) > -1 ? f._pfrL.splice(f._pfrL.indexOf(item), 1) : null;
                            f._pfuL.indexOf(item) > -1 ? f._pfuL.splice(f._pfuL.indexOf(item), 1) : null;
                            f._itFl.indexOf(item) > -1 ? f._itFl.splice(f._itFl.indexOf(item), 1) : null;
                            item = null;
							
							// reset the plugin if there are no any files in the memory
							f._itFl.length == 0 ? f.reset() : null;
                            
							// set feedback caption
							f.set('feedback', null);
							
							// set listInput value
							f.set('listInput', null);
						},
						/**
                         * getItemAttr
                         * get an attribute from item or item.data
                         *
						 * @namespace files
                         * @param {Object} item
						 * @param {String} attr - attribute key
                         * @return {null,String}
                         */
						getItemAttr: function(item, attr) {
							var result = null;
							
							if (item) {
								if (typeof item[attr] != "undefined") {
									result = item[attr];
								} else if (item.data && typeof item.data[attr] != "undefined") {
									result = item.data[attr];
								}
							}
							
							return result;
						},
						/**
                         * clear
                         * clear files from the memory
						 * delete also item.html and item.upload data
                         *
						 * @namespace files
                         * @param {bool} all - delete also appended files?
                         * @void
                         */
						clear: function(all) {
							var i = 0;
							while (i < f._itFl.length) {
								var a = f._itFl[i];
								
								if (!all && a.appended) {
									i++;
									continue;
								}
								
								if (a.html)
									a.html ? f._itFl[i].html.remove() : null;
								
								if (a.upload && a.upload.$ajax)
									f.upload.cancel(a);
								
								f._itFl.splice(i, 1);
							}
							
							// set feedback caption
							f.set('feedback', null);
                            
                            // set listInput value
                            f.set('listInput', null);
							
							// onEmpty callback
							f._itFl.length == 0 && n.onEmpty && $.isFunction(n.onEmpty) ? n.onEmpty(l, p, o, s) : null;
						}
					},
					
					/**
					 * reset
					 * reset the plugin
					 *
					 * @param {bool} all - remove also appended files?
					 * @void
					 */
					reset: function(all) {
						if (all) {
							if (f.clipboard._timer)
								f.clipboard.clean();
							
							$.each(sl, function(i, a) {
								if (i < sl.length)
									a.remove();
							});
							sl = [];
                            f.set('input', '');
						}
						
						f._itRl = [];
                        f._pfuL = [];
                        f._pfrL = [];
						f.files.clear(all);
					},
					/**
					 * destroy
					 * destroy the plugin
					 *
					 * @void
					 */
					destroy: function() {
						f.reset(true);
						f.bindUnbindEvents(false);
						s.removeAttr('style');
						s.insertBefore('.fileuploader');
						s.prop('FileUploader', null);
						p.remove();
						p = o = l = null;
					},
                    
                    /**
                     * @namespace _assets 
                     */
					_assets: {
                        bytesToText: function(bytes) {
                            if (bytes == 0) return '0 Byte';
                            var k = 1000,
								sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
								i = Math.floor(Math.log(bytes) / Math.log(k));
							
                            return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
                        },
                        secondsToText: function(seconds, textFormat) {
                            seconds = parseInt(Math.round(seconds), 10);
                            
                            var hours   = Math.floor(seconds / 3600),
                                minutes = Math.floor((seconds - (hours * 3600)) / 60),
                                seconds = seconds - (hours * 3600) - (minutes * 60),
                                result = "";
                            
                            if (hours > 0 || !textFormat) {
                                result += (hours < 10 ? "0" : "") + hours + (textFormat ? "h " : ":");
                            }
                            if (minutes > 0 || !textFormat) {
                                result += (minutes < 10 && !textFormat ? "0" : "") + minutes + (textFormat ? "m " : ":");
                            }
                            
                            result += (seconds < 10 && !textFormat ? "0" : "") + seconds + (textFormat ? "s" : "");
                            
                            return result;
                        },
						pxToRatio: function(width, height) {
							var gcd = function(a, b) {
									return (b == 0) ? a : gcd (b, a%b);
								},
								r = gcd(width, height);
							
							return [width/r, height/r];
						},
						ratioToPx: function(width, height, ratio) {
							ratio = (ratio+'').split(':');
							
							if (ratio.length < 2)
								return null;
							
							var rWidth = height / ratio[1] * ratio[0],
								rHeight = width / ratio[0] * ratio[1];
							
							return [rWidth, rHeight, ratio[0], ratio[1]];
						},
                        hasAttr: function(attr, el) {
                            var el = !el ? s : el,
                                a = el.attr(attr);
							
                            if (!a || typeof a == 'undefined') {
                                return false;
                            } else {
                                return true;
                            }
                        },
						copyAllAttributes: function(newEl, oldEl) {
							$.each(oldEl.get(0).attributes, function() {
								if (this.name == 'required' || this.name == 'type') return;
								newEl.attr(this.name, this.value);
							});
                            
                            if (oldEl.get(0).FileUploader)
                                newEl.get(0).FileUploader = oldEl.get(0).FileUploader;
							
							return newEl;
						},
						getAllEvents: function(el) {
							var el = !el ? s : el,
								result = [];
							
							el = el.get ? el.get(0) : el;
							for (var key in el) {
								if (key.indexOf('on') === 0) {
									result.push(key.slice(2));
								}
							}
							
							if (result.indexOf('change') == -1)
								result.push('change');
							
							return result.join(' ');
						},
                        isIntoView: function(el) {
                            var windowTop = $(window).scrollTop(),
                                windowBottom = windowTop + window.innerHeight,
                                elTop = el.offset().top,
                                elBottom = elTop + el.outerHeight();

                            return ((windowTop < elTop) && (windowBottom > elBottom));
                        },
						isBlankCanvas: function(canvas) {
							var blank = document.createElement('canvas'),
								result = false;
							
							blank.width = canvas.width;
							blank.height = canvas.height;
							result = canvas.toDataURL() == blank.toDataURL();
							blank = null;
							
							return result;
						},
						dataURItoBlob: function(dataURI, type) {
							var byteString = atob(dataURI.split(',')[1]),
								mimeType = dataURI.split(',')[0].split(':')[1].split(';')[0],
								arrayBuffer = new ArrayBuffer(byteString.length),
								_ia = new Uint8Array(arrayBuffer);
							
							for (var i = 0; i < byteString.length; i++) {
								_ia[i] = byteString.charCodeAt(i);
							}

							var dataView = new DataView(arrayBuffer),
								blob = new Blob([dataView], { type: type || mimeType });
							
							return blob;
						},
                        textParse: function(text, opts, noOptions) {
                            opts = noOptions ? (opts || {}) : $.extend({}, {
                                limit: n.limit,
                                maxSize: n.maxSize,
                                fileMaxSize: n.fileMaxSize,
                                extensions: n.extensions ? n.extensions.join(', ') : null,
                                captions: n.captions
                            }, opts);
							
                            switch (typeof(text)) {
                                case 'string':
                                    text = text.replace(/\$\{(.*?)\}/g, function(match, a) {
                                        var a = a.replace(/ /g, ''),
                                            r = typeof opts[a] != "undefined" && opts[a] != null ? opts[a] : '';
                                        
                                        if (a.indexOf('.') > -1 || a.indexOf('[]') > -1) {
                                            var x = a.substr(0, a.indexOf('.') > -1 ? a.indexOf('.') : a.indexOf('[') > -1 ? a.indexOf('[') : a.length),
                                                y = a.substring(x.length);
                                            if (opts[x]) {
                                                try {
                                                    r = eval('opts["' + x + '"]' + y);
                                                } catch(e) {
                                                    r = '';
                                                }
                                            }
                                        }
										
										r = $.isFunction(r) ? f._assets.textParse(r) : r;
                                        
                                        return r || '';
                                    });
                                    break;
                                case 'function':
                                    text = f._assets.textParse(text(opts, l, p, o, s, f._assets.textParse), opts, noOptions);
                                    break;
                            }
							
							opts = null;
							return text;
                        },
                        textToColor: function(str) {
                            if (!str || str.length == 0)
								return false;
							
                            for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
                            for (var i = 0, colour = '#'; i < 3; colour += ('00' + ((hash >> i++ * 2) & 0xFF)
                                    .toString(16))
                                .slice(-2));
                            return colour;
                        },
						isBrightColor: function(color) {
							var getRGB = function(b) {
									var a;
									if (b && b.constructor == Array && b.length == 3) return b;
									if (a = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(b)) return [parseInt(a[1]), parseInt(a[2]), parseInt(a[3])];
									if (a = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(b)) return [parseFloat(a[1]) * 2.55, parseFloat(a[2]) * 2.55, parseFloat(a[3]) * 2.55];
									if (a = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(b)) return [parseInt(a[1], 16), parseInt(a[2], 16), parseInt(a[3],
										16)];
									if (a = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(b)) return [parseInt(a[1] + a[1], 16), parseInt(a[2] + a[2], 16), parseInt(a[3] + a[3], 16)];
									return (typeof(colors) != "undefined") ? colors[$.trim(b).toLowerCase()] : null
								},
								luminance_get = function(color) {
									var rgb = getRGB(color);
									if (!rgb) return null;
									return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
								};
							
							return luminance_get(color) > 194;
						}
                    },
					
					isSupported: function() {
						return s && s.get(0).files;
					},
					isFileReaderSupported: function() {
						return window.File && window.FileList && window.FileReader;
					},
					isDefaultMode: function() {
						return !n.upload && !n.addMore;
					},
					isAddMoreMode: function() {
						return !n.upload && n.addMore;
					},
					isUploadMode: function() {
						return n.upload;
					},
					
					// fileuploader file list
                    _itFl: [],
					
					// fileuploader file upload pending list
					_pfuL: [],
					
					// fileuploader file render pending list
					_pfrL: [],
					
					// disabled
					disabled: false,
                    
                    // locked
                    locked: false,
					
					// rendered
					rendered: false
				};
			
			// set FileUploader property to the input
            if (n.enableApi) {
                s.prop('FileUploader', {
                    open: function() {
                        s.trigger('click');
                    },
                    getOptions: function() {
                        return n;
                    },
                    getParentEl: function() {
                        return p;
                    },
                    getInputEl: function() {
                        return s;
                    },
                    getNewInputEl: function() {
                        return o;
                    },
                    getListEl: function() {
                        return l;
                    },
                    getListInputEl: function() {
                        return n.listInput;
                    },
                    getFiles: function() {
                        return f._itFl;
                    },
                    getChoosedFiles: function() {
                        return f._itFl.filter(function(a) {
                            return a.choosed;
                        });
                    },
                    getAppendedFiles: function() {
                        return f._itFl.filter(function(a) {
                            return a.appended;
                        });
                    },
                    getUploadedFiles: function() {
                        return f._itFl.filter(function(a) {
                            return a.uploaded;
                        });
                    },
                    getFileList: function(toJson, customKey) {
                        return f.files.list(toJson, customKey, true);
                    },
					updateFileList: function() {
						f.set('listInput', null);
						
						return true;
					},
                    setOption: function(option, value) {
                        n[option] = value;

                        return true;
                    },
                    findFile: function(html) {
                        return f.files.find(html);
                    },
                    append: function(files) {
                        return f.files.append(files);
                    },
                    remove: function(item) {
                        item = item.jquery ? f.files.find(item) : item;

                        if (f._itFl.indexOf(item) > -1) {
                            f.files.remove(item);
                            return true;
                        }

                        return false;
                    },
					uploadStart: function() {
						var choosedFiles = this.getChoosedFiles() || [];
						
						if (f.isUploadMode() && choosedFiles.length > 0 && !choosedFiles[0].uploaded) {
							for(var i = 0; i<choosedFiles.length; i++) {
								f.upload.send(choosedFiles[i]);
							}
						}
					},
                    reset: function() {
                        f.reset(true);
                        return true;
                    },
                    disable: function(lock) {
                        f.set('disabled', true);
                        if (lock)
                            f.locked = true;
                        return true;
                    },
                    enable: function() {
                        f.set('disabled', false);
                        f.locked = false;
                        return true;
                    },
                    destroy: function() {
                        f.destroy();
                        return true;
                    },
                    isEmpty: function() {
                        return f._itFl.length == 0; 
                    },
                    isDisabled: function() {
                        return f.disabled;
                    },
                    isRendered: function() {
                        return f.rendered;
                    },
                    assets: f._assets,
                    getPluginMode: function() {
                        if (f.isDefaultMode())
                            return 'default';

                        if (f.isAddMoreMode())
                            return 'addMore';

                        if (f.isUploadMode())
                            return 'upload';
                    }
                });
            }
            
            // initialize the plugin
			f.init();
            
			return this;
		});
    };
	
	window.$.fileuploader = {
        getInstance: function(input) {
            var $input = input.prop ? input : $(input);

            return $input.prop('FileUploader');
        }
    };
	
	$.fn.fileuploader.defaults = {
        limit: null,
        maxSize: null,
        fileMaxSize: null,
        extensions: null,
		changeInput: true,
		inputNameBrackets: true,
        theme: 'default',
        thumbnails: {
			box: '<div class="fileuploader-items">' +
                      '<ul class="fileuploader-items-list"></ul>' +
                  '</div>',
			boxAppendTo: null,
			item: '<li class="fileuploader-item">' +
                       '<div class="columns">' +
                           '<div class="column-thumbnail">${image}<span class="fileuploader-action-popup"></span></div>' +
                           '<div class="column-title">' +
                               '<div title="${name}">${name}</div>' +
                               '<span>${size2}</span>' +
                           '</div>' +
                           '<div class="column-actions">' +
                               '<a class="fileuploader-action fileuploader-action-remove" title="${captions.remove}"><i><small><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></small></i></a>' +
                           '</div>' +
                       '</div>' +
                       '<div class="progress-bar2">${progressBar}<span></span></div>' +
                   '</li>',
            item2: '<li class="fileuploader-item">' +
                        '<div class="columns">' +
                            '<div class="column-thumbnail">${image}<span class="fileuploader-action-popup"></span></div>' +
                            '<a href="${file}" target="_blank">' +
                                '<div class="column-title">' +
                                    '<div title="${name}">${name}</div>' +
                                    '<span>${size2}</span>' +
                                '</div>' +
                            '</a>' +
                            '<div class="column-actions">' +
                                '<a href="${file}" class="fileuploader-action fileuploader-action-download" title="${captions.download}" download><i></i></a>' +
                                '<a class="fileuploader-action fileuploader-action-remove" title="${captions.remove}"><i></i></a>' +
                            '</div>' +
                        '</div>' +
                    '</li>',
            popup: {
                template: function(data) { return '<div class="fileuploader-popup">' +
                    '<div class="fileuploader-popup-preview">' +
                        '<div class="node ${format}">${reader.node}</div>' +
                        '<div class="tools">' +
                            '<ul>' +
                                '<li>' +
                                    '<span>${captions.name}:</span>' +
                                    '<h5>${name}</h5>' +
                                '</li>' +
                                '<li>' +
                                    '<span>${captions.type}:</span>' +
                                    '<h5>${extension.toUpperCase()}</h5>' +
                                '</li>' +
                                '<li>' +
                                    '<span>${captions.size}:</span>' +
                                    '<h5>${size2}</h5>' +
                                '</li>' +
                                (data.reader && data.reader.width ? '<li>' +
                                    '<span>${captions.dimensions}:</span>' +
                                    '<h5>${reader.width}x${reader.height}px</h5>' +
                                '</li>' : ''
								) +
								(data.reader && data.reader.duration ? '<li>' +
                                    '<span>${captions.duration}:</span>' +
                                    '<h5>${reader.duration2}</h5>' +
                                '</li>' : ''
								) +
                                '<li class="separator"></li>' +
                                (data.format == 'image' && data.reader.src && data.editor ? '<li>' +
                                    '<a data-action="crop">' +
                                        '<i></i>' +
                                        '<span>${captions.crop}</span>' +
                                    '</a>' +
                                '</li>' +
                                '<li>' +
                                    '<a data-action="rotate-cw">' +
                                        '<i></i>' +
                                        '<span>${captions.rotate}</span>' +
                                    '</a>' +
                                '</li>' : ''
								) +
                                '<li>' +
                                    '<a data-action="remove">' +
                                        '<i></i>' +
                                        '<span>${captions.remove}</span>' +
                                    '</a>' +
                                '</li>' +
                            '</ul>' +
                            '<div class="buttons">' +
                                '<a class="fileuploader-popup-button" data-action="cancel">${captions.cancel}</a>' +
                                '<a class="fileuploader-popup-button button-success" data-action="save">${captions.confirm}</a>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'; },
                onShow: function(item) {
                    item.popup.html.on('click', '[data-action="crop"]', function(e) {
						if (item.editor)
                        	item.editor.cropper();
                    }).on('click', '[data-action="rotate-cw"]', function(e) {
						if (item.editor)
                        	item.editor.rotate();
                    }).on('click', '[data-action="remove"]', function(e) {
                        item.popup.close();
                        item.remove();
                    }).on('click', '[data-action="cancel"]', function(e) {
                        item.popup.close();
                    }).on('click', '[data-action="save"]', function(e) {
						if (item.editor)
                        	item.editor.save();
						if (item.popup.close)
							item.popup.close();
                    });
                },
                onHide: function(item) {
                    var popup = item.popup.html;
                    
                    popup.fadeOut(200, function() {
                        popup.remove();
                    });
                }
            },
			itemPrepend: false,
			removeConfirmation: true,
			startImageRenderer: true,
			synchronImages: true,
			canvasImage: true,
			_selectors: {
				list: '.fileuploader-items-list',
				item: '.fileuploader-item',
				start: '.fileuploader-action-start',
				retry: '.fileuploader-action-retry',
				remove: '.fileuploader-action-remove',
				sorter: '.fileuploader-action-sort',
                popup: '.fileuploader-popup',
                popup_open: '.fileuploader-action-popup'
			},
        	beforeShow: null,
			onItemShow: null,
            onItemRemove: function(html) {
                html.children().animate({'opacity': 0}, 200, function() {
                    setTimeout(function() {
                        html.slideUp(200, function() {
                            html.remove();
                        });
                    }, 100);
                });
            },
			onImageLoaded: null
		},
		editor: false,
		sorter: false,
        files: null,
        upload: null,
        dragDrop: true,
        addMore: false,
        skipFileNameCheck: false,
        clipboardPaste: true,
        listInput: true,
        enableApi: false,
		listeners: null,
		onSupportError: null,
        beforeRender: null,
        afterRender: null,
        beforeSelect: null,
        onFilesCheck: null,
        onFileRead: null,
        onSelect: null,
		afterSelect: null,
        onListInput: null,
        onRemove: null,
        onEmpty: null,
        dialogs: {
            alert: function(text) {
                return alert(text);
            },
            confirm: function(text, callback) {
                confirm(text) ? callback() : null;
            }
        },
        captions: {
            button: function(options) { return 'Choose ' + (options.limit == 1 ? 'File' : 'Files'); },
            feedback: function(options) { return 'Choose ' + (options.limit == 1 ? 'file' : 'files') + ' to upload'; },
            feedback2: function(options) { return options.length + ' ' + (options.length > 1 ? ' files were' : ' file was') + ' chosen'; },
			confirm: 'Confirm',
            cancel: 'Cancel',
			name: 'Name',
			type: 'Type',
			size: 'Size',
			dimensions: 'Dimensions',
			duration: 'Duration',
            crop: 'Crop',
            rotate: 'Rotate',
			sort: 'Sort',
            download: 'Download',
            remove: 'Remove',
            drop: 'Drop the files here to Upload',
            paste: '<div class="fileuploader-pending-loader"><div class="left-half" style="animation-duration: ${ms}s"></div><div class="spinner" style="animation-duration: ${ms}s"></div><div class="right-half" style="animation-duration: ${ms}s"></div></div> Pasting a file, click here to cancel.',
            removeConfirmation: 'Are you sure you want to remove this file?',
            errors: {
                filesLimit: 'Only ${limit} files are allowed to be uploaded.',
                filesType: 'Only ${extensions} files are allowed to be uploaded.',
                fileSize: '${name} is too large! Please choose a file up to ${fileMaxSize}MB.',
                filesSizeAll: 'Files that you choosed are too large! Please upload files up to ${maxSize} MB.',
                fileName: 'File with the name ${name} is already selected.',
                folderUpload: 'You are not allowed to upload folders.'
            }
        }
	}
})(jQuery);