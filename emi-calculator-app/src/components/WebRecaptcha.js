import React, { useRef, useImperativeHandle, forwardRef, useState, useCallback, useEffect } from 'react';
import { View, Modal, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';
import { colors } from '../constants/colors';

/**
 * WebRecaptcha - A reCAPTCHA verifier for Firebase Phone Auth
 * Works on web, Android, and iOS
 */
const WebRecaptcha = forwardRef(({ firebaseConfig, onVerify, onError, onClose }, ref) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef(null);
  const resolveRef = useRef(null);
  const rejectRef = useRef(null);
  const webRecaptchaVerifier = useRef(null);

  // For web platform, use Firebase's built-in RecaptchaVerifier
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Create a hidden div for reCAPTCHA on web
      const recaptchaContainer = document.getElementById('recaptcha-container-web');
      if (!recaptchaContainer) {
        const div = document.createElement('div');
        div.id = 'recaptcha-container-web';
        document.body.appendChild(div);
      }

      // Initialize RecaptchaVerifier for web
      if (!webRecaptchaVerifier.current) {
        try {
          const auth = getAuth();
          console.log('Creating RecaptchaVerifier for web...');
          webRecaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container-web', {
            size: 'invisible',
            callback: (response) => {
              console.log('reCAPTCHA solved on web');
              if (onVerify) {
                onVerify(response);
              }
            },
            'expired-callback': () => {
              console.log('reCAPTCHA expired on web');
              if (onError) {
                onError(new Error('reCAPTCHA expired'));
              }
            }
          });
          console.log('RecaptchaVerifier created successfully');
        } catch (error) {
          console.error('Error creating RecaptchaVerifier:', error);
        }
      }
    }

    return () => {
      // Cleanup on unmount
      if (Platform.OS === 'web' && webRecaptchaVerifier.current) {
        try {
          webRecaptchaVerifier.current.clear();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [onVerify, onError]);

  // Create the application verifier interface that Firebase expects
  const createVerifier = useCallback(() => {
    if (Platform.OS === 'web') {
      // For web, return the RecaptchaVerifier instance
      return webRecaptchaVerifier.current;
    } else {
      // For mobile, return custom verifier that shows WebView
      return {
        type: 'recaptcha',
        verify: () => {
          return new Promise((resolve, reject) => {
            resolveRef.current = resolve;
            rejectRef.current = reject;
            setVisible(true);
            setLoading(true);
          });
        }
      };
    }
  }, []);

  // Expose methods to parent component
  useImperativeHandle(ref, () => {
    const verifier = createVerifier();
    return verifier || {
      type: 'recaptcha',
      verify: () => Promise.reject(new Error('Verifier not initialized'))
    };
  }, [createVerifier]);

  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'recaptcha-verified') {
        setVisible(false);
        if (resolveRef.current) {
          resolveRef.current(data.token);
        }
        if (onVerify) {
          onVerify(data.token);
        }
      } else if (data.type === 'recaptcha-error') {
        setVisible(false);
        const error = new Error(data.message || 'reCAPTCHA verification failed');
        if (rejectRef.current) {
          rejectRef.current(error);
        }
        if (onError) {
          onError(error);
        }
      } else if (data.type === 'recaptcha-loaded') {
        setLoading(false);
      } else if (data.type === 'recaptcha-expired') {
        setLoading(false);
      }
    } catch (e) {
      console.error('WebRecaptcha message parse error:', e);
    }
  }, [onVerify, onError]);

  const handleClose = useCallback(() => {
    setVisible(false);
    if (rejectRef.current) {
      rejectRef.current(new Error('reCAPTCHA cancelled by user'));
    }
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // HTML content for the reCAPTCHA widget (for mobile)
  const recaptchaHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        * { box-sizing: border-box; }
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          padding: 20px;
          background-color: #f8f9fa;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .container {
          text-align: center;
          width: 100%;
          max-width: 320px;
        }
        .title {
          color: #333;
          margin-bottom: 20px;
          font-size: 16px;
          font-weight: 500;
        }
        #recaptcha-container {
          display: flex;
          justify-content: center;
          transform-origin: center center;
        }
        .loading {
          color: #666;
          font-size: 14px;
        }
        .error {
          color: #dc3545;
          font-size: 14px;
          margin-top: 10px;
        }
      </style>
      <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
      <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
    </head>
    <body>
      <div class="container">
        <p class="title">Please verify you're human</p>
        <div id="recaptcha-container"></div>
        <p class="loading" id="loading">Loading verification...</p>
        <p class="error" id="error" style="display: none;"></p>
      </div>
      <script>
        (function() {
          try {
            const firebaseConfig = ${JSON.stringify(firebaseConfig)};
            
            if (!firebase.apps.length) {
              firebase.initializeApp(firebaseConfig);
            }
            
            window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
              size: 'normal',
              callback: function(token) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'recaptcha-verified',
                  token: token
                }));
              },
              'expired-callback': function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'recaptcha-expired',
                  message: 'reCAPTCHA expired. Please try again.'
                }));
              },
              'error-callback': function(error) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'recaptcha-error',
                  message: error.message || 'reCAPTCHA error occurred'
                }));
              }
            });
            
            window.recaptchaVerifier.render().then(function(widgetId) {
              document.getElementById('loading').style.display = 'none';
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'recaptcha-loaded',
                widgetId: widgetId
              }));
            }).catch(function(error) {
              document.getElementById('loading').style.display = 'none';
              document.getElementById('error').style.display = 'block';
              document.getElementById('error').textContent = 'Failed to load verification: ' + (error.message || 'Unknown error');
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'recaptcha-error',
                message: error.message || 'Failed to render reCAPTCHA'
              }));
            });
          } catch (error) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').textContent = 'Initialization error: ' + (error.message || 'Unknown error');
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'recaptcha-error',
              message: error.message || 'Failed to initialize Firebase'
            }));
          }
        })();
      </script>
    </body>
    </html>
  `;

  // For web platform, don't render anything (div is created in useEffect)
  if (Platform.OS === 'web') {
    return null;
  }

  // For mobile platforms, render modal with WebView
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Security Verification</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading verification...</Text>
            </View>
          )}
          
          <WebView
            ref={webViewRef}
            source={{ html: recaptchaHTML }}
            onMessage={handleMessage}
            style={[styles.webview, loading && styles.hidden]}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={false}
            scalesPageToFit={true}
            originWhitelist={['*']}
            mixedContentMode="compatibility"
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error:', nativeEvent);
              if (onError) {
                onError(new Error('WebView failed to load'));
              }
            }}
          />
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 20,
    color: '#666',
  },
  webview: {
    height: 400,
    backgroundColor: '#f8f9fa',
  },
  hidden: {
    opacity: 0,
    height: 0,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
});

export default WebRecaptcha;
