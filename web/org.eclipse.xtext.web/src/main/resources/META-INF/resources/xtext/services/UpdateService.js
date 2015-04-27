/*******************************************************************************
 * Copyright (c) 2015 itemis AG (http://www.itemis.eu) and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *******************************************************************************/

define(["xtext/services/AbstractXtextService"], function(AbstractXtextService) {
	
	function UpdateService(serverUrl, resourceUri) {
		this.initialize(serverUrl, resourceUri, "update");
		this._completionCallbacks = [];
	};
	
	UpdateService.prototype = new AbstractXtextService();
	
	UpdateService.prototype.computeDelta = function(s1, s2, result) {
		var start = 0, s1length = s1.length, s2length = s2.length;
		while (start < s1length && start < s2length && s1.charCodeAt(start) === s2.charCodeAt(start)) {
			start++;
		}
		if (start === s1length && start === s2length) {
			return;
		}
		result.deltaOffset = start;
		if (start === s1length) {
			result.deltaText = s2.substring(start, s2length);
			result.deltaReplaceLength = 0;
			return;
		} else if (start === s2length) {
			result.deltaText = "";
			result.deltaReplaceLength = s1length - start;
			return;
		}
		
		var end1 = s1length - 1, end2 = s2length - 1;
		while (end1 >= start && end2 >= start && s1.charCodeAt(end1) === s2.charCodeAt(end2)) {
			end1--;
			end2--;
		}
		result.deltaText = s2.substring(start, end2 + 1);
		result.deltaReplaceLength = end1 - start + 1;
	};
	
	UpdateService.prototype.onComplete = function(xhr, textStatus) {
		this._isRunningUpdate = false;
		var callbacks = this._completionCallbacks;
		this._completionCallbacks = [];
		for (callback in callbacks) {
			callback();
		}
	}
	
	UpdateService.prototype.checkRunningUpdate = function(callback) {
		if (this._isRunningUpdate) {
			this._completionCallbacks.push(callback);
			return true;
		} else {
			this._isRunningUpdate = true;
			return false;
		}
	}

	UpdateService.prototype.update = function(editorContext, params) {
		if (this.checkRunningUpdate(function() { this.update(editorContext, params) })) {
			return;
		}
		
		var serverData = {
			contentType : params.contentType
		};
		var currentText = editorContext.getText();
		var knownServerState = editorContext.getServerState();
		if (params.sendFullText || knownServerState.text === undefined) {
			serverData.fullText = currentText;
		} else {
			this.computeDelta(knownServerState.text, currentText, serverData);
			if (serverData.deltaText === undefined) {
				this.onComplete();
				return;
			}
			serverData.requiredStateId = knownServerState.stateId;
		}

		var self = this;
		self.sendRequest(editorContext, {
			type : "PUT",
			data : serverData,
			success : function(result) {
				editorContext.updateServerState(currentText, result.stateId);
				return true;
			},
			error : function(xhr, textStatus, errorThrown) {
				// TODO try again?
				return false;
			},
			complete : self.onComplete
		});
	};
	
	return UpdateService;
});