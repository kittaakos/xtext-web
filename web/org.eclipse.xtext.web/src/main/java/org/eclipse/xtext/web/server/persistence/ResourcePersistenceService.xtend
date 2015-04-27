/*******************************************************************************
 * Copyright (c) 2015 itemis AG (http://www.itemis.eu) and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *******************************************************************************/
package org.eclipse.xtext.web.server.persistence

import com.google.inject.Singleton
import java.io.IOException
import org.apache.log4j.Logger
import org.eclipse.xtext.web.server.ISessionStore
import org.eclipse.xtext.web.server.InvalidRequestException
import org.eclipse.xtext.web.server.model.DocumentStateResult
import org.eclipse.xtext.web.server.model.XtextWebDocument
import org.eclipse.xtext.web.server.model.XtextWebDocumentAccess

import static org.eclipse.xtext.web.server.InvalidRequestException.Type.*

@Singleton
class ResourcePersistenceService {
	
	val LOG = Logger.getLogger(class)
	
	def load(String resourceId, IServerResourceHandler resourceHandler, ISessionStore sessionStore)
			throws InvalidRequestException {
		LOG.trace('Xtext Service: load')
		val document = sessionStore.get(XtextWebDocument -> resourceId, [
			try {
				resourceHandler.get(resourceId)
			} catch (IOException ioe) {
				throw new InvalidRequestException(RESOURCE_NOT_FOUND, 'The requested resource was not found.')
			}
		])
		new XtextWebDocumentAccess(document).readOnly[ it, cancelIndicator |
			val result = new ResourceContentResult(text)
			result.dirty = dirty
			result.stateId = stateId
			return result
		]
	}
	
	def revert(String resourceId, IServerResourceHandler resourceHandler, ISessionStore sessionStore)
			throws InvalidRequestException {
		LOG.trace('Xtext Service: revert')
		try {
			val document = resourceHandler.get(resourceId)
			val result = new ResourceContentResult(document.text)
			result.stateId = document.stateId
			sessionStore.put(XtextWebDocument -> resourceId, document)
			return result
		} catch (IOException ioe) {
			throw new InvalidRequestException(RESOURCE_NOT_FOUND, 'The requested resource was not found.')
		}
	}
	
	def save(XtextWebDocumentAccess document, IServerResourceHandler resourceHandler)
			throws InvalidRequestException {
		LOG.trace('Xtext Service: save')
		document.readOnly[ it, cancelIndicator |
			try {
				resourceHandler.put(it)
				dirty = false
			} catch (IOException ioe) {
				throw new InvalidRequestException(RESOURCE_NOT_FOUND, ioe.message)
			}
			return new DocumentStateResult(stateId)
		]
	}
	
}