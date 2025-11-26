import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { View, Modal, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Platform } from 'react-native';
import { colors } from '../constants/colors';

// Lazy load WebView to prevent crashes on startup
let WebView = null;

/**
 * WebRecaptcha - A web-based reCAPTCHA verifier that works with Expo managed workflow
 * This replaces expo-firebase-recaptcha which has native dependency issues
 */
const WebRecaptcha = forwardRef(({ firebaseConfig, onVerify, onError, onClose }, ref) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  const webViewRef = useRef(null);
  const resolveRef = useRef(null);
  const rejectRef = useRef(null);

  // Lazy load WebView when component mounts
  useEffect(() => {
    const loadWebView = async () => {
      try {
        if (Platform.OS !== 'web') {
          const webViewModule = await import('react-native-webview');
          WebView = webViewModule.WebView || webViewModule.default;
          setWebViewLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load WebView:', error);
      }
    };
    loadWebView();
  }, []);

  // Expose verify method to parent component
  useImperativeHandle(ref, () => ({
    verify: () => {
      return new Promise((resolve, reject) => {
        if (Platform.OS === 'web') {
          // For web, resolve immediately (Firebase handles reCAPTCHA differently on web)
          resolve('web-token');
          return;
        }
        
        if (!webViewLoaded || !WebView) {
          reject(new Error('WebView not available'));
          return;
        }
        
        resolveRef.current = resolve;
        rejectRef.current = reject;
        setVisible(true);
        setLoading(true);
      });
    },
    close: () => {
      setVisible(false);
    }
  }));

  const handleMessage = (event) => {
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
      }
    } catch (e) {
      console.error('WebRecaptcha message parse error:', e);
    }
  };

  const handleClose = () => {
    setVisible(false);
    if (rejectRef.current) {
      rejectRef.current(new Error('reCAPTCHA cancelled by user'));
    }
    if (onClose) {
      onClose();
    }
  };

  // HTML content for the reCAPTCHA widget
  const recaptchaHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background-color: #f5f5f5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .container {
          text-align: center;
          padding: 20px;
        }
        .title {
          color: #333;
          margin-bottom: 20px;
          font-size: 18px;
        }
        #recaptcha-container {
          display: inline-block;
        }
        .loading {
          color: #666;
        }
      </style>
      <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
      <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
    </head>
    <body>
      <div class="container">
        <p class="title">Verify you're human</p>
        <div id="recaptcha-container"></div>
        <p class="loading" id="loading">Loading verification...</p>
      </div>
      <script>
        try {
          // Initialize Firebase
          const firebaseConfig = ${JSON.stringify(firebaseConfig)};
          
          if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
          }
          
          // Set up reCAPTCHA verifier
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
                type: 'recaptcha-error',
                message: 'reCAPTCHA expired. Please try again.'
              }));
            }
          });
          
          // Render the reCAPTCHA
          window.recaptchaVerifier.render().then(function() {
            document.getElementById('loading').style.display = 'none';
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'recaptcha-loaded'
            }));
          }).catch(function(error) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'recaptcha-error',
              message: error.message || 'Failed to load reCAPTCHA'
            }));
          });
        } catch (error) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'recaptcha-error',
            message: error.message || 'Failed to initialize reCAPTCHA'
          }));
        }
      </script>
    </body>
    </html>
  `;

  // Don't render anything on web or if WebView isn't loaded
  if (Platform.OS === 'web' || !webViewLoaded || !WebView) {
    return null;
  }

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
              <ActivityIndicator size="large" color={colors?.primary || '#2563eb'} />
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
            onError={(e) => {
              console.error('WebView error:', e.nativeEvent);
              handleClose();
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
  },
  hidden: {
    opacity: 0,
    height: 0,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
});

export default WebRecaptcha;
