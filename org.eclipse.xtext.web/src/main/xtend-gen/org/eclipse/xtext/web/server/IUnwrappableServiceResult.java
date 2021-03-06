/**
 * Copyright (c) 2016 TypeFox GmbH (http://www.typefox.io) and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.eclipse.xtext.web.server;

import org.eclipse.xtext.web.server.IServiceResult;

/**
 * Service results that implement this interface are unwrapped, i.e. the content of the result object
 * is sent to the client instead of a Json object.
 */
@SuppressWarnings("all")
public interface IUnwrappableServiceResult extends IServiceResult {
  /**
   * The actual content to write into the request response.
   */
  public abstract String getContent();
  
  /**
   * The content type of the text content.
   */
  public abstract String getContentType();
}
